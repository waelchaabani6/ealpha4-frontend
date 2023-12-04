import ImportedCsv from '@component/import/importCsv';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ImportMember() {
  const navigate = useNavigate();
  const { moduleName } = useParams();
  const TEACHER = 'teacher';
  const STUDENT = 'student';
  const PARENT = 'parent';

  useEffect(() => {
    if (moduleName !== TEACHER && moduleName !== STUDENT && moduleName !== PARENT) {
      navigate('/404');
    }
  }, [moduleName]);

  return (
    <div>
      <ImportedCsv />
    </div>
  );
}
