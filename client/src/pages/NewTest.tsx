
import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lesson, Upload } from '../../../shared/types';
import { api, getUser } from '../api';

/** 3. ekrāns — Jauns tests: materiāla augšupielāde vai tēmas ievade. */
export function NewTest() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    api<Upload[]>('GET', '/uploads')
      .then(setUploads)
      .catch((e) => setError(e.message));
  }, []);

  // Parbauda izveleta faila formatu un izmeru
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    setError('');
    setSelectedFile(null);

    if (!file) return;

    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    // Faila formata parbaude
    if (!extension || !allowedExtensions.includes(extension)) {
      setError('Atļauti tikai PDF, DOCX un TXT faili.');
      e.target.value = '';
      return;
    }

    // Faila izmera parbaude (15 MB)
    const maxSize = 15 * 1024 * 1024;

    if (file.size > maxSize) {
      setError('Fails ir pārāk liels. Maksimālais izmērs ir 15 MB.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  }

  async function generate() {
    try {
      setError('');

      // TODO: augšupielādēt izvēlēto failu (POST /uploads, multipart)
      const lesson = await api<Lesson>('POST', '/lessons', { topic });
      navigate(`/test/${lesson.id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="cols">
      <div className="card">
        <h3>Jauns tests</h3>

        <label>
          Augšupielādēt mācību materiālus (maks. 15 MB)
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
          />
        </label>

        {selectedFile && (
          <p className="muted">
            Izvēlētais fails: {selectedFile.name}
          </p>
        )}

        <p className="muted">vai</p>

        <label>
          Apgūstamā tēma
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>

        <p className="error">{error}</p>

        <button onClick={generate}>
          Ģenerēt jautājumus
        </button>
      </div>

      <div className="card">
        <h3>Augšupielādētie materiāli</h3>

        {uploads.length === 0 && (
          <p className="muted">Nav materiālu</p>
        )}

        <ul>
          {uploads.map((u) => (
            <li key={u.id}>{u.fileName}</li>
          ))}
        </ul>

        <p className="muted">
          Augšupielādes šonedēļ: {uploads.length} / 20
        </p>

        {getUser()?.plan === 'free' && (
          <div className="ad">
            Reklāma (bezmaksas lietotājiem)
          </div>
        )}
      </div>
    </div>
  );
}
