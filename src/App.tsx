import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import EntryController from './pages/EntryController/EntryController';
import Desktop from './pages/Desktop/Desktop';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            <Route path="/" element={<EntryController />} />
            <Route path="/desktop" element={<Desktop />} />
            {/* Additional routes can be added here as needed */}
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
}
