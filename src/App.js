import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Security, LoginCallback } from '@okta/okta-react';
import { OktaAuth } from '@okta/okta-auth-js';
import Header from './components/Header';
import TaskManager from './components/TaskManager';
import HomePage from './pages/HomePage';
import './App.css';

// Okta configuration
const oktaConfig = {
    issuer: 'https://dev-65717442.okta.com/oauth2/default',
    clientId: '0oam1j7y90mgy3cng5d7',
    redirectUri: `${window.location.origin}/login/callback`,
    scopes: ['openid', 'profile', 'email'],
    pkce: false,
    responseType: 'code', // Explicitly specifying the response type
};

// Create OktaAuth instance (without restoreOriginalUri in oktaConfig)
const oktaAuth = new OktaAuth(oktaConfig);

// Define restoreOriginalUri callback
const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    window.location.replace(originalUri || '/');
};

const App = () => {
    return (
        <Router>
            {/* Pass restoreOriginalUri only to the Security component */}
            <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login/callback" element={<LoginCallback />} />
                    <Route path="/tasks" element={<TaskManager />} />
                </Routes>
            </Security>
        </Router>
    );
};

export default App;