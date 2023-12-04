import Button from '@component/button/button';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="comingSoon">
      <h2>Coming Soon</h2>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );
};

export default ComingSoon;
