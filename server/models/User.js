const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../services/firebase');

class User {
  async createUser(userData) {
    if (!db) throw new Error('Firebase Database not initialized');

    const { email, password, firstName, lastName } = userData;
    const emailLowerCase = email.toLowerCase();

    // Check if user already exists
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', emailLowerCase).get();

    if (!snapshot.empty) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userDocRef = usersRef.doc();
    const userId = userDocRef.id;

    const user = {
      id: userId,
      email: emailLowerCase,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    await userDocRef.set(user);

    return this.getUserSafeData(user);
  }

  async authenticateUser(email, password) {
    if (!db) throw new Error('Firebase Database not initialized');

    const emailLowerCase = email.toLowerCase();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', emailLowerCase).get();

    if (snapshot.empty) {
      throw new Error('Invalid email or password');
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    user.id = userDoc.id;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await userDoc.ref.update({ lastLogin: user.lastLogin });

    return this.getUserSafeData(user);
  }

  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'ayurvaid_secret_key',
      { expiresIn: '7d' }
    );
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ayurvaid_secret_key');
      return decoded.userId;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async findUserById(userId) {
    if (!db) return null;
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    data.id = doc.id;
    return data;
  }

  getUserSafeData(user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // Account management
  async updateEmail(userId, newEmail) {
    if (!db) throw new Error('Firebase Database not initialized');
    const emailLowerCase = newEmail.toLowerCase();
    
    const snapshot = await db.collection('users').where('email', '==', emailLowerCase).get();
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      if (userDoc.id !== userId) {
        throw new Error('Email is already in use by another account');
      }
    }
    
    await db.collection('users').doc(userId).update({ email: emailLowerCase });
    return emailLowerCase;
  }

  async updatePassword(userId, currentPassword, newPassword) {
    if (!db) throw new Error('Firebase Database not initialized');
    
    const userDocRef = db.collection('users').doc(userId);
    const doc = await userDocRef.get();
    if (!doc.exists) throw new Error('User not found');
    
    const user = doc.data();
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      throw new Error('Incorrect current password');
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await userDocRef.update({ password: hashedPassword });
    return true;
  }

  async deleteAccount(userId) {
    if (!db) throw new Error('Firebase Database not initialized');
    // First, try to clean up user's subcollections if possible (for production, a Cloud Function is better)
    // For now, we delete the user document
    await db.collection('users').doc(userId).delete();
    return true;
  }


  // Profile management
  async addUserProfile(userId, profileData) {
    if (!db) throw new Error('Firebase Database not initialized');

    const profilesRef = db.collection('users').doc(userId).collection('profiles');
    const existing = await profilesRef.get();
    
    let profileId;
    let newProfileRef;

    if (!existing.empty) {
      newProfileRef = existing.docs[0].ref;
      profileId = newProfileRef.id;
    } else {
      newProfileRef = profilesRef.doc();
      profileId = newProfileRef.id;
    }

    const profile = {
      id: profileId,
      ...profileData,
      createdAt: new Date().toISOString()
    };

    await newProfileRef.set(profile);
    return profileId;
  }

  async getUserProfiles(userId) {
    if (!db) return [];

    const snapshot = await db.collection('users').doc(userId).collection('profiles').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
  }

  async getUserProfile(userId, profileId) {
    if (!db) return null;

    const doc = await db.collection('users').doc(userId).collection('profiles').doc(profileId).get();
    return doc.exists ? doc.data() : null;
  }

  // Conversation management
  async createConversation(userId, title = null) {
    if (!db) throw new Error('Firebase Database not initialized');

    const convRef = db.collection('users').doc(userId).collection('conversations').doc();
    const conversationId = convRef.id;

    const conversation = {
      id: conversationId,
      title: title || 'New Health Consultation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await convRef.set(conversation);
    return conversationId;
  }

  async getUserConversations(userId) {
    if (!db) return [];

    const snapshot = await db.collection('users').doc(userId).collection('conversations').orderBy('updatedAt', 'desc').get();
    return snapshot.docs.map(doc => {
      const conv = doc.data();
      return {
        id: conv.id,
        title: conv.title,
        messageCount: conv.messages ? conv.messages.length : 0,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      };
    });
  }

  async getConversation(userId, conversationId) {
    if (!db) return null;

    const doc = await db.collection('users').doc(userId).collection('conversations').doc(conversationId).get();
    return doc.exists ? doc.data() : null;
  }

  async addMessageToConversation(userId, conversationId, message) {
    if (!db) throw new Error('Firebase Database not initialized');

    const convRef = db.collection('users').doc(userId).collection('conversations').doc(conversationId);

    // Use transaction or arrayUnion in production, here we fetch and update for simplicity
    const doc = await convRef.get();
    if (!doc.exists) {
      throw new Error('Conversation not found');
    }

    const conversation = doc.data();

    if (!conversation.messages) {
      conversation.messages = [];
    }

    // Remove undefined properties to satisfy Firestore constraints
    const cleanMessage = Object.fromEntries(
      Object.entries(message).filter(([, value]) => value !== undefined)
    );
    const msgObj = {
      id: Date.now(),
      ...cleanMessage,
      timestamp: new Date().toISOString()
    };
    conversation.messages.push(msgObj);
    conversation.updatedAt = new Date().toISOString();

    // Auto-generate title from first user message if still default
    if (conversation.title === 'New Health Consultation' &&
      message.type === 'user' &&
      conversation.messages.length <= 2) {
      conversation.title = this.generateConversationTitle(message.content);
    }

    await convRef.update({
      messages: conversation.messages,
      updatedAt: conversation.updatedAt,
      title: conversation.title
    });

    return conversation;
  }

  generateConversationTitle(firstMessage) {
    const words = firstMessage.toLowerCase().split(' ');
    const keywords = ['diet', 'sleep', 'stress', 'energy', 'health', 'weight', 'digestion', 'exercise', 'meditation'];

    const foundKeywords = words.filter(word => keywords.includes(word));

    if (foundKeywords.length > 0) {
      return `${foundKeywords[0].charAt(0).toUpperCase() + foundKeywords[0].slice(1)} Consultation`;
    }

    const title = words.slice(0, 3).join(' ');
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  async deleteConversation(userId, conversationId) {
    if (!db) throw new Error('Firebase Database not initialized');

    await db.collection('users').doc(userId).collection('conversations').doc(conversationId).delete();
    return true;
  }
}

module.exports = new User();