import { FormEvent, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { saveContactMessage } from '../../lib/contactMessages';

export default function ContactApp() {
  const { theme, accentColor } = useSelector((state: RootState) => state.os);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [hasError, setHasError] = useState(false);
  const isDark = theme === 'dark';
  const fieldStyles = {
    '& .MuiInputLabel-root': { color: isDark ? '#bbb' : '#555' },
    '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
    '& .MuiOutlinedInput-root': {
      color: isDark ? '#fff' : '#111',
      bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff',
      '& fieldset': { borderColor: isDark ? '#666' : '#bdbdbd' },
      '&:hover fieldset': { borderColor: isDark ? '#aaa' : '#777' },
      '&.Mui-focused fieldset': { borderColor: accentColor },
    },
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    setHasError(false);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setHasError(true);
      setFeedback('Please complete all fields before sending.');
      return;
    }
    setIsSending(true);

    try {
      await saveContactMessage({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      setName('');
      setEmail('');
      setMessage('');
      setFeedback('Your message has been sent.');
    } catch (error) {
      setHasError(true);
      setFeedback(error instanceof Error ? error.message : 'Unable to send your message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, sm: 3 }, bgcolor: isDark ? '#1e1e1e' : '#fff', color: isDark ? '#fff' : '#111' }}>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Contact Me</Typography>
        <Typography variant="body2" sx={{ mb: 3, color: isDark ? '#bbb' : '#555' }}>
          Send a message using the form below.
        </Typography>
        <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            required
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            inputProps={{ maxLength: 120 }}
            size="small"
            sx={fieldStyles}
          />
          <TextField
            required
            type="email"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            inputProps={{ maxLength: 254 }}
            size="small"
            sx={fieldStyles}
          />
          <TextField
            required
            multiline
            minRows={5}
            label="Message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            inputProps={{ maxLength: 5000 }}
            sx={fieldStyles}
          />
          <Button type="submit" variant="contained" disabled={isSending} sx={{ justifySelf: 'start', bgcolor: accentColor }}>
            {isSending ? 'Sending…' : 'Send message'}
          </Button>
          {feedback && <Typography role={hasError ? 'alert' : 'status'} variant="body2" sx={{ color: hasError ? '#ef5350' : '#4caf50' }}>{feedback}</Typography>}
        </Box>
      </Box>
    </Box>
  );
}
