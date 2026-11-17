import { doc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../firebase';
import {
  initialPortfolioState,
  PortfolioEntry,
  PortfolioState,
} from '../store/portfolioSlice';

type PortfolioPatchHandler = (patch: Partial<PortfolioState>) => void;
type PortfolioErrorHandler = (error: Error) => void;
const maxFirestoreDocumentBytes = 950_000;

function assertDocumentSize(path: string, value: Record<string, unknown>) {
  const size = new TextEncoder().encode(JSON.stringify(value)).length;
  if (size > maxFirestoreDocumentBytes) {
    throw new Error(`${path} is too large to save to Firestore. Reduce embedded images or text and try again.`);
  }
}

export function subscribeToPortfolio(
  getPortfolio: () => PortfolioState,
  onUpdate: PortfolioPatchHandler,
  onError: PortfolioErrorHandler,
): () => void {
  if (!isFirebaseConfigured) return () => undefined;

  const unsubscribe = [
    onSnapshot(doc(db, 'portfolio', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        const homeRichText = snapshot.data().homeRichText;
        if (typeof homeRichText === 'string') onUpdate({ homeRichText });
      }
    }, onError),
    ...initialPortfolioState.sections.map((section) =>
      onSnapshot(doc(db, 'portfolioSections', section.id), (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const current = getPortfolio();
        const currentSection = current.sections.find((item) => item.id === section.id) ?? section;
        const updatedSection = {
          ...currentSection,
          title: typeof data.title === 'string' ? data.title : currentSection.title,
          visible: typeof data.visible === 'boolean' ? data.visible : currentSection.visible,
          serial: typeof data.serial === 'number' ? data.serial : currentSection.serial,
        };
        const patch: Partial<PortfolioState> = {
          sections: current.sections.some((item) => item.id === section.id)
            ? current.sections.map((item) => item.id === section.id ? updatedSection : item)
            : [...current.sections, updatedSection],
        };

        if (section.id === 'experience') {
          if (Array.isArray(data.professionalExperience)) {
            patch.professionalExperience = data.professionalExperience as PortfolioEntry[];
          }
          if (Array.isArray(data.academicExperience)) {
            patch.academicExperience = data.academicExperience as PortfolioEntry[];
          }
        } else if (Array.isArray(data.entries)) {
          Object.assign(patch, { [section.id]: data.entries as PortfolioEntry[] });
        }

        onUpdate(patch);
      }, onError),
    ),
    onSnapshot(doc(db, 'portfolioSettings', 'commands'), (snapshot) => {
      const commands = snapshot.data()?.commands;
      if (snapshot.exists() && Array.isArray(commands)) {
        onUpdate({ commands });
      }
    }, onError),
    onSnapshot(doc(db, 'portfolioSettings', 'schedules'), (snapshot) => {
      const schedules = snapshot.data()?.schedules;
      if (snapshot.exists() && Array.isArray(schedules)) {
        onUpdate({ schedules });
      }
    }, onError),
  ];

  return () => unsubscribe.forEach((stop) => stop());
}

export async function savePortfolioToCloud(portfolio: PortfolioState): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* settings before saving portfolio data.');
  }

  const batch = writeBatch(db);
  const homeData = {
    homeRichText: portfolio.homeRichText,
  };
  assertDocumentSize('Home content', homeData);
  batch.set(doc(db, 'portfolio', 'main'), { ...homeData, updatedAt: serverTimestamp() });

  for (const section of portfolio.sections) {
    const data: Record<string, unknown> = {
      title: section.title,
      visible: section.visible,
      serial: section.serial,
      updatedAt: serverTimestamp(),
    };

    if (section.id === 'experience') {
      data.professionalExperience = portfolio.professionalExperience;
      data.academicExperience = portfolio.academicExperience;
    } else {
      data.entries = portfolio[section.id];
    }

    assertDocumentSize(`Section "${section.title}"`, data);
    batch.set(doc(db, 'portfolioSections', section.id), data);
  }

  const commandsData = {
    commands: portfolio.commands,
  };
  assertDocumentSize('Terminal commands', commandsData);
  batch.set(doc(db, 'portfolioSettings', 'commands'), { ...commandsData, updatedAt: serverTimestamp() });
  const schedulesData = {
    schedules: portfolio.schedules,
  };
  assertDocumentSize('Schedules', schedulesData);
  batch.set(doc(db, 'portfolioSettings', 'schedules'), { ...schedulesData, updatedAt: serverTimestamp() });

  await batch.commit();
}
