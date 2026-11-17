import { Box, Card, CardContent, Chip, Link, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { sanitizeRichText } from '../../lib/richText';
import { PortfolioEntry, PortfolioSectionId } from '../../store/portfolioSlice';
import { RootState } from '../../store/store';

type Props = { sectionId: PortfolioSectionId; experienceKey?: 'professionalExperience' | 'academicExperience' };

function entryName(entry: PortfolioEntry, index: number): string {
  return String(entry.title || entry.role || entry.name || entry.degree || entry.language || `Item ${index + 1}`);
}

function externalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export default function PortfolioSectionApp({ sectionId, experienceKey }: Props) {
  const { theme, accentColor } = useSelector((state: RootState) => state.os);
  const portfolio = useSelector((state: RootState) => state.portfolio);
  const isDark = theme === 'dark';
  const dataKey = experienceKey ?? (sectionId === 'english' ? 'english' : sectionId);
  const entries = portfolio[dataKey] as PortfolioEntry[];
  const title = experienceKey
    ? experienceKey === 'professionalExperience' ? 'Professional Experience' : 'Academic Experience'
    : portfolio.sections.find((section) => section.id === sectionId)?.title || sectionId;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: isDark ? '#1e1e1e' : '#fff', minHeight: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2.5, color: isDark ? '#fff' : '#111' }}>{title}</Typography>
      {entries.length === 0 ? (
        <Typography sx={{ color: isDark ? '#aaa' : '#666' }}>No {title.toLowerCase()} added yet.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
          {entries.map((entry, index) => {
            const imageUrl = typeof entry.imageUrl === 'string' ? externalUrl(entry.imageUrl) : null;
            const description = typeof entry.description === 'string' ? sanitizeRichText(entry.description) : '';
            const lists = Object.entries(entry).filter(([, value]) => Array.isArray(value));
            const fields = Object.entries(entry).filter(([key, value]) =>
              !['id', 'serial', 'title', 'role', 'name', 'degree', 'language', 'description', 'imageUrl'].includes(key) &&
              typeof value === 'string' && value.trim() && /link|url/i.test(key),
            );
            const details = Object.entries(entry).filter(([key, value]) =>
              !['id', 'serial', 'title', 'role', 'name', 'degree', 'language', 'description', 'imageUrl'].includes(key) &&
              typeof value === 'string' && value.trim() && !/link|url/i.test(key),
            );
            return (
              <Card key={entry.id} sx={{ bgcolor: isDark ? '#2d2d2d' : '#f6f6f6', border: `1px solid ${isDark ? '#444' : '#e5e5e5'}`, color: isDark ? '#fff' : '#111' }}>
                {imageUrl && <Box component="img" src={imageUrl} alt={String(entry.title || '')} sx={{ display: 'block', width: '100%', maxHeight: 240, objectFit: 'cover' }} />}
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: accentColor, fontWeight: 700 }}>{entry.serial || index + 1}</Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600 }}>{entryName(entry, index)}</Typography>
                  </Box>
                  {details.map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{ color: isDark ? '#bbb' : '#555', mb: 0.4 }}>
                      <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}:</strong> {String(value)}
                    </Typography>
                  ))}
                  {fields.map(([key, value]) => {
                    const href = externalUrl(String(value));
                    return href ? <Link key={key} href={href} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-block', mr: 2, mt: 1, color: accentColor }}>{key.replace(/Link|url/i, '') || 'Link'}</Link> : null;
                  })}
                  {lists.map(([key, value]) => (
                    <Box key={key} sx={{ mt: 1.5 }}>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: isDark ? '#aaa' : '#666' }}>
                        {key === 'tools' ? 'Tools' : key.replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {(value as string[]).map((item, itemIndex) => <Chip key={`${item}-${itemIndex}`} size="small" label={item} sx={{ bgcolor: isDark ? '#404040' : '#e8e8e8', color: isDark ? '#eee' : '#333' }} />)}
                      </Box>
                    </Box>
                  ))}
                  {description && <Box className="portfolio-rich-text" sx={{ mt: 1.5, color: isDark ? '#ccc' : '#555', '& a': { color: accentColor }, '& ul, & ol': { pl: 3 } }} dangerouslySetInnerHTML={{ __html: description }} />}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
