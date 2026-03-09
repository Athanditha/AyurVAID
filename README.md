# AyurVAID - Premium Ayurvedic Health Intelligence

A premium AI-powered health intelligence system built with **React** and **Node.js**, based on ancient Ayurvedic principles, featuring comprehensive dosha analysis and personalized wellness guidance with explainable AI technology.

## 🚀 **Technology Stack**

### Frontend (React)
- **React 18** with Hooks and Context
- **Framer Motion** for premium animations
- **Lucide React** for beautiful icons
- **Axios** for API communication
- **CSS3** with CSS Variables and Grid/Flexbox

### Backend (Node.js)
- **Express.js** REST API
- **OpenAI GPT-4** integration
- **CORS** enabled for cross-origin requests
- **UUID** for session management

## 🎯 **Features**

### 🔍 Comprehensive Dosha Assessment
- 12 detailed questions covering physical constitution, digestion, mental patterns, and lifestyle
- Scientific scoring system for Vata, Pitta, and Kapha doshas
- Detailed constitutional analysis with primary and secondary dosha identification

### 🤖 AI-Powered Health Advisor
- Personalized recommendations based on individual dosha profile
- Context-aware chatbot using OpenAI GPT-4
- Tailored advice for diet, lifestyle, exercise, and mental wellness

### 📊 Explainable AI Integration
- Transparent reasoning for all recommendations
- Confidence scoring for analysis results
- Clear explanations of why specific advice is given
- Source attribution and methodology disclosure

### 💎 Premium User Experience
- **Apple-inspired Design**: San Francisco font system and premium aesthetics
- **Natural Green Theme**: Calming color palette promoting wellness
- **Smooth Animations**: 60fps animations with Framer Motion
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Accessibility**: High contrast support and reduced motion options

## 🛠️ **Installation & Setup**

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd ayurvaid

# Install server dependencies
npm install

# Install client dependencies
npm run install-client
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file and add your OpenAI API key:
```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 3. Start the Application

#### Development Mode (Recommended)
```bash
# Starts both React dev server (port 3000) and API server (port 3001)
npm run dev
```

#### Production Mode
```bash
# Build React app and start production server
npm run build
npm start
```

### 4. Access the Application
- **Development**: http://localhost:3000 (React dev server)
- **Production**: http://localhost:3001 (Express server serving React build)

## 📁 **Project Structure**

```
ayurvaid/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.js
│   │   │   ├── WelcomeScreen.js
│   │   │   ├── AssessmentScreen.js
│   │   │   ├── ResultsScreen.js
│   │   │   ├── ChatScreen.js
│   │   │   └── LoadingOverlay.js
│   │   ├── App.js         # Main React app
│   │   └── App.css        # Global styles
│   └── package.json       # Client dependencies
├── server/                # Node.js backend
│   ├── models/           # Data models
│   │   ├── DoshaQuestions.js
│   │   └── DoshaAnalyzer.js
│   ├── routes/           # API routes
│   │   ├── dosha.js
│   │   ├── chat.js
│   │   └── profile.js
│   └── server.js         # Express server
├── .env                  # Environment variables
└── package.json          # Root package.json
```

## 🎨 **Component Architecture**

### React Components
- **App.js**: Main application with state management and routing
- **Header**: Premium branding and navigation
- **WelcomeScreen**: Landing page with feature showcase
- **AssessmentScreen**: Interactive dosha questionnaire
- **ResultsScreen**: Detailed analysis results with visualizations
- **ChatScreen**: AI-powered health consultation interface
- **LoadingOverlay**: Elegant loading states

### State Management
- React Hooks (useState, useEffect, useRef)
- Props drilling for component communication
- Axios for API state management

## 🔧 **API Endpoints**

### Dosha Assessment
- `GET /api/dosha/questions` - Retrieve assessment questions
- `POST /api/dosha/analyze` - Submit responses and get analysis

### User Profile Management
- `POST /api/profile/store` - Store user profile after analysis
- `GET /api/profile/:profileId` - Retrieve user profile
- `PUT /api/profile/:profileId/chat` - Update chat history

### AI Chat Interface
- `POST /api/chat/message` - Send message to AI advisor

### Health Check
- `GET /api/health` - Application health status

## 🎯 **Development Scripts**

```bash
# Start both client and server in development
npm run dev

# Start only the server
npm run server

# Start only the client
npm run client

# Build React app for production
npm run build

# Install all dependencies
npm run install-all
```

## 🌟 **Premium Features**

### Visual Design
- **Natural Color Palette**: Carefully selected greens and whites
- **Apple Typography**: System fonts for native feel
- **Micro-interactions**: Hover effects, button animations, loading states
- **Gradient Backgrounds**: Subtle gradients throughout the interface

### User Experience
- **Progressive Disclosure**: Information revealed as needed
- **Smooth Transitions**: Page transitions with Framer Motion
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: WCAG compliant with keyboard navigation

### Performance
- **Code Splitting**: React lazy loading for optimal performance
- **Optimized Images**: Efficient asset loading
- **API Caching**: Smart caching strategies
- **Bundle Optimization**: Webpack optimizations for production

## 🚀 **Deployment**

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_production_api_key
```

## 🔒 **Security Features**

- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- Environment variable protection
- API rate limiting ready
- Secure headers configuration

## 📱 **Mobile Experience**

- Responsive design for all screen sizes
- Touch-friendly interface elements
- Optimized animations for mobile performance
- Progressive Web App ready

## 🎨 **Customization**

### Theming
- CSS custom properties for easy color changes
- Modular component styling
- Dark mode ready architecture

### Content
- Easily modifiable dosha questions
- Customizable AI prompts
- Flexible recommendation system

## 📊 **Analytics Ready**

- Event tracking hooks prepared
- User journey mapping capability
- Performance monitoring integration points

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details

## ⚠️ **Disclaimer**

This application provides educational information about Ayurvedic principles and should not be considered medical advice. Always consult with qualified healthcare professionals for medical concerns.

## 🆘 **Support**

For questions or support, please open an issue in the repository or contact the development team.

---

**AyurVAID** - Where ancient wisdom meets modern AI technology 🌿✨

## Features

### 🔍 Comprehensive Dosha Assessment
- 12 detailed questions covering physical constitution, digestion, mental patterns, and lifestyle
- Scientific scoring system for Vata, Pitta, and Kapha doshas
- Detailed constitutional analysis with primary and secondary dosha identification

### 🤖 AI-Powered Health Advisor
- Personalized recommendations based on individual dosha profile
- Context-aware chatbot using OpenAI GPT-4
- Tailored advice for diet, lifestyle, exercise, and mental wellness

### 📊 Explainable AI Integration
- Transparent reasoning for all recommendations
- Confidence scoring for analysis results
- Clear explanations of why specific advice is given
- Source attribution and methodology disclosure

### 💡 Personalized Recommendations
- **Dietary Guidelines**: Foods to favor and avoid based on dosha type
- **Lifestyle Tips**: Daily routines and practices for balance
- **Exercise Plans**: Appropriate physical activities for constitution
- **Mental Wellness**: Stress management and mindfulness practices

## Technology Stack

- **Backend**: Node.js, Express.js
- **AI Integration**: OpenAI GPT-4 API
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Modern responsive design with CSS Grid/Flexbox
- **Data Storage**: In-memory storage (easily replaceable with database)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### 1. Clone and Install
```bash
git clone <repository-url>
cd ayurveda-health-ai
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file and add your OpenAI API key:
```
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 3. Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Access the Application
Open your browser and navigate to: `http://localhost:3000`

## API Endpoints

### Dosha Assessment
- `GET /api/dosha/questions` - Retrieve assessment questions
- `POST /api/dosha/analyze` - Submit responses and get analysis

### User Profile Management
- `POST /api/profile/store` - Store user profile after analysis
- `GET /api/profile/:profileId` - Retrieve user profile
- `PUT /api/profile/:profileId/chat` - Update chat history

### AI Chat Interface
- `POST /api/chat/message` - Send message to AI advisor

### Health Check
- `GET /api/health` - Application health status

## Usage Flow

1. **Welcome Screen**: Introduction to the system and features
2. **Dosha Assessment**: Complete 12-question constitutional analysis
3. **Results Display**: View detailed dosha breakdown with explanations
4. **AI Consultation**: Chat with personalized health advisor
5. **Ongoing Support**: Continue conversations with context-aware AI

## Dosha Analysis System

### Question Categories
- **Physical Constitution**: Body frame, skin, hair characteristics
- **Digestion & Appetite**: Eating patterns and digestive health
- **Mental & Emotional**: Stress response and cognitive patterns
- **Sleep & Energy**: Rest patterns and energy levels
- **Environmental**: Weather preferences and sensitivities
- **Physical Activity**: Exercise preferences and stamina
- **Communication**: Speaking and interaction styles

### Scoring Algorithm
- Weighted responses based on question importance
- Percentage calculation for each dosha
- Primary and secondary dosha identification
- Constitutional type classification (Single, Dual, or Tri-dosha)

## Explainable AI Features

### Analysis Transparency
- **Reasoning**: Step-by-step explanation of dosha determination
- **Confidence Scoring**: High/Medium/Low confidence based on score distribution
- **Factor Analysis**: Key factors influencing the assessment
- **Methodology**: Clear description of analysis approach

### Recommendation Explanations
- **Dosha Context**: Why advice suits specific constitution
- **Traditional Basis**: Grounding in Ayurvedic principles
- **Personalization**: How recommendations are tailored
- **Source Attribution**: References to traditional texts and modern research

## Customization Options

### Adding New Questions
Edit `models/DoshaQuestions.js` to add or modify assessment questions.

### Modifying Dosha Descriptions
Update `models/DoshaAnalyzer.js` to change dosha characteristics and recommendations.

### Styling Customization
Modify `public/styles.css` for visual customization.

### AI Prompt Tuning
Adjust the system prompt in `routes/chat.js` for different AI behavior.

## Production Deployment

### Database Integration
Replace in-memory storage with your preferred database:
- MongoDB with Mongoose
- PostgreSQL with Sequelize
- MySQL with TypeORM

### Security Enhancements
- Add authentication and authorization
- Implement rate limiting
- Add input validation and sanitization
- Use HTTPS in production

### Performance Optimization
- Add caching layer (Redis)
- Implement database indexing
- Add CDN for static assets
- Use process managers (PM2)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This application provides educational information about Ayurvedic principles and should not be considered medical advice. Always consult with qualified healthcare professionals for medical concerns.

## Support

For questions or support, please open an issue in the repository or contact the development team.