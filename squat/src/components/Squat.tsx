import './Squat.css';
import { useTranslation } from "react-i18next";

interface ContainerProps { }

const Squat: React.FC<ContainerProps> = () => {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t("homePage.squat.content")}</p>
    </div>
  );
};

export default Squat;
