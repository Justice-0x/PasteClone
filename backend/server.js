require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fileUploadRouter = require('./fileUpload');
const Stripe = require('stripe');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001; // Backend will run on a different port

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

// In-memory store for pastes (NOT FOR PRODUCTION)
let pastes = {}; // Using an object to store pastes by ID

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Helper: Find or create user for social login
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function findOrCreateSocialUser(provider, providerId, profile) {
  let user = null;
  const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
  // Try to find user by provider/providerId
  const findQuery = 'SELECT * FROM users WHERE provider = $1 AND provider_id = $2';
  const findRes = await pool.query(findQuery, [provider, providerId]);
  if (findRes.rows.length > 0) {
    user = findRes.rows[0];
  } else {
    // Create new user
    const insertQuery = 'INSERT INTO users (username, email, provider, provider_id, is_pro) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const username = profile.username || profile.displayName || (email ? email.split('@')[0] : provider + '_' + providerId);
    const insertRes = await pool.query(insertQuery, [username, email, provider, providerId, false]);
    user = insertRes.rows[0];
  }
  return user;
}

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateSocialUser('google', profile.id, profile);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'GITHUB_CLIENT_ID',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'GITHUB_CLIENT_SECRET',
  callbackURL: '/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateSocialUser('github', profile.id, profile);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// API Endpoints

// POST /api/pastes - Create a new paste
app.post('/api/pastes', (req, res) => {
    try {
        const { content, title, syntax, expiration, exposure, folder } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const pasteId = uuidv4(); // Generate a unique ID
        const newPaste = {
            id: pasteId,
            content,
            title: title || 'MyGuy\'s Fresh Drop',
            syntax: syntax || 'none',
            expiration: expiration || '1d',
            exposure: exposure || 'public',
            folder: folder || 'none',
            timestamp: new Date().toISOString()
        };

        pastes[pasteId] = newPaste;

        console.log(`Paste created: ${pasteId}, Title: ${newPaste.title}`);
        res.status(201).json(newPaste);
    } catch (error) {
        console.error('Error creating paste:', error);
        res.status(500).json({ message: 'Server error while creating paste' });
    }
});

// GET /api/pastes/:id - Retrieve a paste
app.get('/api/pastes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const paste = pastes[id];

        if (paste) {
            console.log(`Paste retrieved: ${id}`);
            res.status(200).json(paste);
        } else {
            console.log(`Paste not found: ${id}`);
            res.status(404).json({ message: 'Paste not found or expired' });
        }
    } catch (error) {
        console.error('Error retrieving paste:', error);
        res.status(500).json({ message: 'Server error while retrieving paste' });
    }
});

app.use('/api/file', fileUploadRouter);

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '10GB File Upload Pro Tier',
            },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:1234/success', // Change to your frontend URL
      cancel_url: 'http://localhost:1234/cancel',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/'); // Redirect to your frontend after login
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/'); // Redirect to your frontend after login
});

// Webhook endpoint
app.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // You should store the user's email or user ID in the session's metadata when creating the session
    const email = session.customer_email || (session.metadata && session.metadata.user_email);
    if (email) {
      // Mark user as pro in your database
      await pool.query('UPDATE users SET is_pro = TRUE WHERE email = $1', [email]);
      console.log(`User with email ${email} upgraded to Pro.`);
    }
  }

  res.json({received: true});
});

console.log('DO_SPACES_ENDPOINT:', process.env.DO_SPACES_ENDPOINT);

app.listen(PORT, () => {
    console.log(`MyGuy Paste backend server running on http://localhost:${PORT}`);
}); 