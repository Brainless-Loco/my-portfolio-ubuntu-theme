import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { Award, Building2, CalendarDays, ChevronDown, ExternalLink, Github, GraduationCap, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';
import { sanitizeRichText } from '../../lib/richText';
import { PortfolioEntry, PortfolioSectionId } from '../../store/portfolioSlice';
import { RootState } from '../../store/store';

type Props = { sectionId: PortfolioSectionId; experienceKey?: 'professionalExperience' | 'academicExperience' };
type SkillGroup = { label: string; entries: PortfolioEntry[] };
type PublicationGroup = { label: string; entries: PortfolioEntry[] };

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

function textValue(entry: PortfolioEntry, key: string): string {
  const value = entry[key];
  return typeof value === 'string' ? value.trim() : '';
}

function listValue(value: string | string[] | undefined): string[] {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n') : [];
  return values.map((item) => item.trim()).filter(Boolean);
}

function isLinkField(key: string): boolean {
  return /link|url|web(site)?/i.test(key);
}

function linkLabel(key: string): string {
  if (/workplaceWeb/i.test(key)) return 'Website';
  if (/github/i.test(key)) return 'GitHub';
  if (/live/i.test(key)) return 'Live demo';
  const label = key.replace(/link|url|website?/ig, '').replace(/([A-Z])/g, ' $1').trim();
  return label || 'Open link';
}

function groupSkills(entries: PortfolioEntry[]): SkillGroup[] {
  const groups = new Map<string, SkillGroup>();
  entries.forEach((entry) => {
    const label = textValue(entry, 'category') || 'Other';
    const key = label.replace(/\s+/g, ' ').toLocaleLowerCase();
    const group = groups.get(key) ?? { label, entries: [] };
    group.entries.push(entry);
    groups.set(key, group);
  });
  return Array.from(groups.values());
}

function groupPublications(entries: PortfolioEntry[], order: string[]): PublicationGroup[] {
  const groups = new Map<string, PublicationGroup>();
  entries.forEach((entry) => {
    const label = textValue(entry, 'publicationType') || 'Other';
    const key = label.replace(/\s+/g, ' ').toLocaleLowerCase();
    const group = groups.get(key) ?? { label, entries: [] };
    group.entries.push(entry);
    groups.set(key, group);
  });

  const groupOrder = new Map(order.map((type, index) => [type.replace(/\s+/g, ' ').toLocaleLowerCase(), index]));
  return Array.from(groups.entries())
    .sort(([firstKey], [secondKey]) => (groupOrder.get(firstKey) ?? Number.MAX_SAFE_INTEGER) - (groupOrder.get(secondKey) ?? Number.MAX_SAFE_INTEGER))
    .map(([, group]) => ({
      ...group,
      entries: group.entries
        .map((entry, index) => ({ entry, index, serial: Number(entry.serial) }))
        .sort((first, second) => {
          const firstOrder = Number.isFinite(first.serial) ? first.serial : Number.MAX_SAFE_INTEGER;
          const secondOrder = Number.isFinite(second.serial) ? second.serial : Number.MAX_SAFE_INTEGER;
          return firstOrder - secondOrder || first.index - second.index;
        })
        .map(({ entry }) => entry),
    }));
}

function PortfolioDescription({
  description,
  accentColor,
  textColor,
  background,
  borderColor,
}: {
  description: string;
  accentColor: string;
  textColor: string;
  background: string;
  borderColor: string;
}) {
  if (!description) return null;
  return (
    <details style={{ marginTop: 12, border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden' }}>
      <summary style={{ cursor: 'pointer', padding: '9px 12px', color: accentColor, fontWeight: 600 }}>
        Show details
      </summary>
      <Box
        className="portfolio-rich-text"
        sx={{
          p: 1.5,
          bgcolor: background,
          color: textColor,
          borderTop: `1px solid ${borderColor}`,
          '& a': { color: accentColor, pointerEvents: 'auto', cursor: 'pointer' },
        }}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </details>
  );
}

function PortfolioLink({ field, value, accentColor }: { field: string; value: string; accentColor: string }) {
  const href = externalUrl(value);
  if (!href) return null;
  return (
    <a
      key={field}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: accentColor, textDecoration: 'none' }}
    >
      <ExternalLink size={15} aria-hidden="true" />
      {linkLabel(field)}
    </a>
  );
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
  const isExperience = Boolean(experienceKey);
  const isRecentActivities = sectionId === 'news' && !experienceKey;
  const [visibleActivityCount, setVisibleActivityCount] = useState(5);
  const activityScrollRef = useRef<HTMLDivElement>(null);
  const activitySentinelRef = useRef<HTMLDivElement>(null);
  const orderedEntries = useMemo(
    () => isRecentActivities ? [...entries].reverse() : entries,
    [entries, isRecentActivities],
  );
  const visibleEntries = isRecentActivities ? orderedEntries.slice(0, visibleActivityCount) : orderedEntries;
  const skills = sectionId === 'skills' ? groupSkills(entries) : [];
  const publicationGroups = sectionId === 'publications'
    ? groupPublications(entries, portfolio.publicationTypeOrder ?? [])
    : [];

  useEffect(() => {
    setVisibleActivityCount(5);
  }, [sectionId]);

  useEffect(() => {
    const sentinel = activitySentinelRef.current;
    const root = activityScrollRef.current;
    if (!isRecentActivities || !sentinel || !root || visibleActivityCount >= orderedEntries.length) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((observations) => {
      if (observations.some((observation) => observation.isIntersecting)) {
        setVisibleActivityCount((count) => Math.min(count + 5, orderedEntries.length));
      }
    }, { root, rootMargin: '120px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isRecentActivities, orderedEntries.length, visibleActivityCount]);

  const textColor = isDark ? '#fff' : '#111';
  const mutedText = isDark ? '#bbb' : '#555';
  const cardBackground = isDark ? '#2d2d2d' : '#f6f6f6';
  const detailBackground = isDark ? '#242424' : '#fff';
  const borderColor = isDark ? '#444' : '#e5e5e5';

  return (
    <Box
      ref={activityScrollRef}
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: isDark ? '#1e1e1e' : '#fff',
        minHeight: '100%',
        ...(isRecentActivities ? { height: '100%', overflowY: 'auto' } : {}),
      }}
    >
      <Typography variant="h5" sx={{ mb: 2.5, color: textColor }}>{title}</Typography>
      {entries.length === 0 ? (
        <Typography sx={{ color: mutedText }}>No {title.toLowerCase()} added yet.</Typography>
      ) : sectionId === 'skills' ? (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {skills.map((group) => (
            <Card key={group.label.toLocaleLowerCase()} sx={{ bgcolor: cardBackground, border: `1px solid ${borderColor}`, color: textColor }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>{group.label}</Typography>
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {group.entries.map((entry, index) => {
                    const description = typeof entry.description === 'string' ? sanitizeRichText(entry.description) : '';
                    const links = Object.entries(entry).filter(([key, value]) => isLinkField(key) && typeof value === 'string' && value.trim());
                    return (
                      <Box key={entry.id} sx={{ border: `1px solid ${borderColor}`, borderRadius: 2, p: 1.5 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Chip size="small" label={entryName(entry, index)} sx={{ bgcolor: isDark ? '#404040' : '#e8e8e8', color: textColor }} />
                          {textValue(entry, 'score') && <Typography variant="body2" sx={{ color: mutedText }}>{textValue(entry, 'score')}</Typography>}
                        </Box>
                        {links.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
                            {links.map(([key, value]) => <PortfolioLink key={key} field={key} value={String(value)} accentColor={accentColor} />)}
                          </Box>
                        )}
                        <PortfolioDescription
                          description={description}
                          accentColor={accentColor}
                          textColor={textColor}
                          background={detailBackground}
                          borderColor={borderColor}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : isRecentActivities ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.75 }}>
          {visibleEntries.map((entry, index) => {
            const description = typeof entry.description === 'string' ? sanitizeRichText(entry.description) : '';
            const date = textValue(entry, 'date');
            const links = Object.entries(entry).filter(([key, value]) => isLinkField(key) && typeof value === 'string' && value.trim());
            return (
              <Box key={entry.id} component="details" className="activity-accordion" sx={{ border: `1px solid ${borderColor}`, borderRadius: 1.5, bgcolor: cardBackground }}>
                <Box component="summary" className="activity-accordion-summary" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.9, cursor: 'pointer', listStyle: 'none' }}>
                  {date && <Typography component="span" variant="caption" sx={{ flexShrink: 0, color: mutedText }}>{date}</Typography>}
                  <Typography component="span" variant="body2" sx={{ flex: 1, color: textColor, fontWeight: 600 }}>{entryName(entry, index)}</Typography>
                  <ChevronDown className="activity-accordion-chevron" size={17} aria-hidden="true" />
                </Box>
                {(description || links.length > 0) && (
                  <Box sx={{ px: 1.5, pb: 1.25, pt: 0.5, borderTop: `1px solid ${borderColor}` }}>
                    {links.length > 0 && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: description ? 1 : 0 }}>{links.map(([key, value]) => <PortfolioLink key={key} field={key} value={String(value)} accentColor={accentColor} />)}</Box>}
                    {description && <Box className="portfolio-rich-text" sx={{ color: mutedText, '& a': { color: accentColor } }} dangerouslySetInnerHTML={{ __html: description }} />}
                  </Box>
                )}
              </Box>
            );
          })}
          {visibleActivityCount < orderedEntries.length && <Box ref={activitySentinelRef} aria-hidden="true" sx={{ height: 1 }} />}
        </Box>
      ) : sectionId === 'publications' ? (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {publicationGroups.map((group) => (
            <Box key={group.label}>
              <Typography variant="h6" sx={{ mb: 1, color: textColor }}>{group.label}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.75 }}>
                {group.entries.map((entry, index) => {
                  const description = typeof entry.description === 'string' ? sanitizeRichText(entry.description) : '';
                  const href = externalUrl(textValue(entry, 'url'));
                  const author = textValue(entry, 'author');
                  const publisher = textValue(entry, 'publication');
                  const date = textValue(entry, 'date');
                  return (
                    <Card key={entry.id} sx={{ bgcolor: cardBackground, border: `1px solid ${borderColor}`, color: textColor }}>
                      <CardContent sx={{ '&:last-child': { pb: 1.5 }, py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          {href ? (
                            <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: accentColor, fontWeight: 600, textDecoration: 'none' }}>
                              {entryName(entry, index)} <ExternalLink size={14} aria-hidden="true" />
                            </a>
                          ) : <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{entryName(entry, index)}</Typography>}
                          {date && <Typography variant="caption" sx={{ flexShrink: 0, color: mutedText }}>{date}</Typography>}
                        </Box>
                        {(author || publisher) && <Typography variant="body2" sx={{ mt: 0.4, color: mutedText }}>{[author, publisher].filter(Boolean).join(' · ')}</Typography>}
                        <PortfolioDescription description={description} accentColor={accentColor} textColor={textColor} background={detailBackground} borderColor={borderColor} />
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: ['activities', 'certifications', 'projects', 'honors', 'education'].includes(sectionId) ? '1fr' : { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
            {visibleEntries.map((entry, index) => {
              const imageUrl = typeof entry.imageUrl === 'string' ? externalUrl(entry.imageUrl) : null;
              const description = typeof entry.description === 'string' ? sanitizeRichText(entry.description) : '';
              const linkFields = Object.entries(entry).filter(([key, value]) =>
                isLinkField(key) && typeof value === 'string' && value.trim(),
              );
              const lists = Object.entries(entry).filter(([key, value]) =>
                Array.isArray(value) && key !== 'tags' && key !== 'responsibilities',
              );
              const details = Object.entries(entry).filter(([key, value]) =>
                !['id', 'serial', 'title', 'role', 'name', 'degree', 'language', 'description', 'imageUrl'].includes(key) &&
                !isLinkField(key) && typeof value === 'string' && value.trim() &&
                !(isExperience && ['workplaceName', 'workplaceAddress', 'startDate', 'endDate', 'tags', 'responsibilities'].includes(key)),
              );
              const tags = isExperience ? listValue(entry.tags ?? entry.responsibilities) : [];
              const workplaceName = textValue(entry, 'workplaceName');
              const workplaceAddress = textValue(entry, 'workplaceAddress');
              const dateRange = [textValue(entry, 'startDate'), textValue(entry, 'endDate')].filter(Boolean).join(' - ');

              if (sectionId === 'activities') {
                return (
                  <Card key={entry.id} sx={{ bgcolor: cardBackground, border: `1px solid ${borderColor}`, color: textColor }}>
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <Typography variant="h6" sx={{ mb: 0.75, fontSize: '1.05rem', fontWeight: 600 }}>{entryName(entry, index)}</Typography>
                      {textValue(entry, 'organization') && <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: mutedText }}><Building2 size={16} aria-hidden="true" />{textValue(entry, 'organization')}</Typography>}
                      {dateRange && <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, color: mutedText }}><CalendarDays size={16} aria-hidden="true" />{dateRange}</Typography>}
                      <PortfolioDescription description={description} accentColor={accentColor} textColor={textColor} background={detailBackground} borderColor={borderColor} />
                    </CardContent>
                  </Card>
                );
              }

              if (sectionId === 'certifications') {
                const certificateUrl = externalUrl(textValue(entry, 'certificateLink'));
                return (
                  <Card key={entry.id} sx={{ bgcolor: cardBackground, border: `1px solid ${borderColor}`, color: textColor }}>
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '1.05rem', fontWeight: 600 }}>
                        <Award size={18} aria-hidden="true" />
                        {certificateUrl
                          ? <a href={certificateUrl} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, textDecoration: 'none' }}>{entryName(entry, index)} <ExternalLink size={14} aria-hidden="true" /></a>
                          : entryName(entry, index)}
                      </Typography>
                      {textValue(entry, 'issuer') && <Typography variant="body2" sx={{ mt: 0.75, color: mutedText }}>{textValue(entry, 'issuer')}</Typography>}
                      {textValue(entry, 'date') && <Typography variant="caption" sx={{ display: 'block', mt: 0.4, color: mutedText }}>{textValue(entry, 'date')}</Typography>}
                      <PortfolioDescription description={description} accentColor={accentColor} textColor={textColor} background={detailBackground} borderColor={borderColor} />
                    </CardContent>
                  </Card>
                );
              }

              if (sectionId === 'projects') {
                const githubUrl = externalUrl(textValue(entry, 'githubLink'));
                const liveUrl = externalUrl(textValue(entry, 'liveLink'));
                return (
                  <Card key={entry.id} sx={{ bgcolor: cardBackground, border: `1px solid ${borderColor}`, color: textColor }}>
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <Typography variant="h6" sx={{ mb: 0.75, fontSize: '1.05rem', fontWeight: 600 }}>{entryName(entry, index)}</Typography>
                      {textValue(entry, 'projectTime') && <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: mutedText }}><CalendarDays size={15} aria-hidden="true" />{textValue(entry, 'projectTime')}</Typography>}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mt: 1 }}>
                        {listValue(entry.tools).map((tool, toolIndex) => <Chip key={`${tool}-${toolIndex}`} size="small" label={tool} sx={{ bgcolor: isDark ? '#404040' : '#e8e8e8', color: mutedText }} />)}
                        {githubUrl && <a aria-label="GitHub project" href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', color: accentColor }}><Github size={19} /></a>}
                        {liveUrl && <a aria-label="Live project" href={liveUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', color: accentColor }}><ExternalLink size={17} /></a>}
                      </Box>
                      <PortfolioDescription description={description} accentColor={accentColor} textColor={textColor} background={detailBackground} borderColor={borderColor} />
                    </CardContent>
                  </Card>
                );
              }

              if (sectionId === 'honors') {
                const url = externalUrl(textValue(entry, 'url'));
                return (
                  <Card key={entry.id} sx={{ bgcolor: cardBackground, border: `1px solid ${borderColor}`, color: textColor }}>
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <Typography variant="h6" sx={{ mb: 0.4, fontSize: '1.05rem', fontWeight: 600 }}>{entryName(entry, index)}</Typography>
                      {textValue(entry, 'issuer') && <Typography variant="body2" sx={{ color: mutedText }}>{textValue(entry, 'issuer')}</Typography>}
                      {textValue(entry, 'date') && <Typography variant="caption" sx={{ display: 'block', mt: 0.4, color: mutedText }}>{textValue(entry, 'date')}</Typography>}
                      {url && <Box sx={{ mt: 0.75 }}><a aria-label="Award details" href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', color: accentColor }}><ExternalLink size={16} /></a></Box>}
                      <PortfolioDescription description={description} accentColor={accentColor} textColor={textColor} background={detailBackground} borderColor={borderColor} />
                    </CardContent>
                  </Card>
                );
              }

              if (sectionId === 'education') {
                const subject = textValue(entry, 'subject') || textValue(entry, 'department');
                const dates = [textValue(entry, 'startDate'), textValue(entry, 'endDate')].filter(Boolean).join(' - ');
                return (
                  <Card key={entry.id} sx={{ bgcolor: cardBackground, border: `1px solid ${borderColor}`, color: textColor }}>
                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                      <Typography variant="h6" sx={{ mb: 0.4, fontSize: '1.05rem', fontWeight: 600 }}>{entryName(entry, index)}</Typography>
                      {subject && <Typography variant="body2" sx={{ color: mutedText }}>{subject}</Typography>}
                      {textValue(entry, 'institution') && <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75, color: mutedText }}><GraduationCap size={16} aria-hidden="true" />{textValue(entry, 'institution')}</Typography>}
                      {textValue(entry, 'location') && <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4, color: mutedText }}><MapPin size={16} aria-hidden="true" />{textValue(entry, 'location')}</Typography>}
                      {dates && <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: mutedText }}>{dates}</Typography>}
                      <PortfolioDescription description={description} accentColor={accentColor} textColor={textColor} background={detailBackground} borderColor={borderColor} />
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={entry.id} sx={{ bgcolor: cardBackground, border: `1px solid ${borderColor}`, color: textColor }}>
                  {imageUrl && <Box component="img" src={imageUrl} alt={String(entry.title || '')} sx={{ display: 'block', width: '100%', maxHeight: 240, objectFit: 'cover' }} />}
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1.05rem', fontWeight: 600 }}>
                      {entryName(entry, index)}
                    </Typography>
                    {isExperience ? (
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        {workplaceName && <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: mutedText }}><Building2 size={16} aria-hidden="true" />{workplaceName}</Typography>}
                        {workplaceAddress && <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: mutedText }}><MapPin size={16} aria-hidden="true" />{workplaceAddress}</Typography>}
                        {dateRange && <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: mutedText }}><CalendarDays size={16} aria-hidden="true" />{dateRange}</Typography>}
                      </Box>
                    ) : details.map(([key, value]) => (
                      <Typography key={key} variant="body2" sx={{ color: mutedText, mb: 0.4 }}>
                        <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}:</strong> {String(value)}
                      </Typography>
                    ))}
                    {linkFields.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.25 }}>
                        {linkFields.map(([key, value]) => <PortfolioLink key={key} field={key} value={String(value)} accentColor={accentColor} />)}
                      </Box>
                    )}
                    {tags.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: mutedText }}>Tags</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {tags.map((item, itemIndex) => <Chip key={`${item}-${itemIndex}`} size="small" label={item} sx={{ bgcolor: isDark ? '#404040' : '#e8e8e8', color: isDark ? '#eee' : '#333' }} />)}
                        </Box>
                      </Box>
                    )}
                    {lists.map(([key, value]) => (
                      <Box key={key} sx={{ mt: 1.5 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: mutedText }}>
                          {key === 'tools' ? 'Tools' : key.replace(/([A-Z])/g, ' $1')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {(value as string[]).map((item, itemIndex) => <Chip key={`${item}-${itemIndex}`} size="small" label={item} sx={{ bgcolor: isDark ? '#404040' : '#e8e8e8', color: isDark ? '#eee' : '#333' }} />)}
                        </Box>
                      </Box>
                    ))}
                    <PortfolioDescription
                      description={description}
                      accentColor={accentColor}
                      textColor={textColor}
                      background={detailBackground}
                      borderColor={borderColor}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
