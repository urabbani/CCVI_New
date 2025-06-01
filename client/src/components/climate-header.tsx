import React from "react";

// Use process.env.PUBLIC_URL to get the correct base path
const PUBLIC_URL = "https://pakwmis.iwmi.org/SIPS/";

const Header = () => {
  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={leftColumnStyle}>
          <h1 className="site-title text-2xl d-none d-sm-block">
            Pakistan CCVI Dashboard
          </h1>
        </div>
        <div style={rightColumnStyle}>
          <div style={logoContainerStyle}>
            <img
              style={logoStyle}
              src={`${PUBLIC_URL}/logos/iwmi.png`}
              alt="IWMI logo"
            />
            <img
              style={logoStyle}
              src={`${PUBLIC_URL}/logos/cgiar.png`}
              alt="CGIAR logo"
            />
            <img
              style={logoStyle}
              src={`${PUBLIC_URL}/logos/uk-aid.png`}
              alt="UK Aid logo"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const headerStyle = {
  padding: "1rem 0",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const containerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 1rem",
};

const leftColumnStyle = {
  flex: 1,
};

const rightColumnStyle = {
  flex: 1,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
};

const logoContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px", // Space between logos
};

const logoStyle = {
  height: "30px",
  display: "block",
};

export default Header;
