import React from "react";
import { useSchoolLogo } from "../../store/schoolIdentityStore";

type SchoolLogoProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">;

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ alt = "Logo", ...props }) => {
  const logo = useSchoolLogo();
  return <img {...props} alt={alt} src={logo} />;
};

export default SchoolLogo;
