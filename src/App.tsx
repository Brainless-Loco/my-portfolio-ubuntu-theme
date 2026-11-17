import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { initialPortfolioState, mergePortfolio } from './store/portfolioSlice';
import { subscribeToPortfolio } from './lib/portfolioCloud';
import EntryController from './pages/EntryController/EntryController';
import Desktop from './pages/Desktop/Desktop';
import Admin from './pages/Admin/Admin';

const publicRoutes = [
  'home',
  'experience',
  'projects',
  'certifications',
  'gallery',
  'skills',
  'english',
  'education',
  'honors',
  'activities',
  'publications',
  'news',
  'recent',
  'starred',
  'trash',
];

function PortfolioCloudSync() {
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    const savedPortfolio = store.getState().portfolio;
    const savedSections = Array.isArray(savedPortfolio.sections) ? savedPortfolio.sections : [];
    dispatch(mergePortfolio({
      ...initialPortfolioState,
      ...savedPortfolio,
      sections: initialPortfolioState.sections.map((section) =>
        savedSections.find((savedSection) => savedSection.id === section.id) ?? section,
      ),
    }));

    return subscribeToPortfolio(
      () => store.getState().portfolio,
      (patch) => {
        dispatch(mergePortfolio(patch));
        setError('');
      },
      (syncError) => {
        console.error('Unable to sync portfolio from Firebase:', syncError);
        setError(`Portfolio data could not sync: ${syncError.message}`);
      },
    );
  }, [dispatch]);

  return error ? (
    <div role="alert" className="fixed bottom-4 right-4 z-[10001] max-w-sm rounded-lg bg-red-800 px-4 py-3 text-sm text-white shadow-xl">
      {error}
    </div>
  ) : null;
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <PortfolioCloudSync />
          <Routes>
            <Route path="/" element={<EntryController />} />
            <Route path="/desktop" element={<Desktop />} />
            <Route path="/admin" element={<Admin />} />
            {publicRoutes.map((route) => (
              <Route key={route} path={`/${route}`} element={<Desktop />} />
            ))}
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
}
