import React from 'react';
import StaticHeader from './staticHeader';
import StaticFooter from './staticFooter';

const SystemRequirements: React.FC = () => {
  return (
    <>
      <StaticHeader />
      <div style={{ maxWidth: '1200px', margin: '100px auto', padding: '20px', backgroundColor: '#f7f7f7', color: '#333', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        <header style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--sunlight)', fontSize: '2rem' }}>eAlpha System Requirements</h1>
        </header>

        <section id="system-requirements" className="section">
          <p>The eAlpha system requirements include the latest versions of Google™ Chrome™, Microsoft Edge®, Mozilla® Firefox®, and Apple® Safari®. By designating officially-supported operating systems and browsers, ealpha is able to ensure an optimal user experience; however, ealpha will operate in other, untested combinations of operating systems and browsers.</p>
          
          <h2>Operating System and Browser Support Matrix</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--light-accent)', color: '#575252' }}>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Operating System</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>OS Version</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Browser</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Browser Version (or latest)</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Screen Resolution</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Accessibility Screen Reader</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Accessibility Keyboard</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Windows® 10</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>10</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Edge</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>121</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Multiple</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Support</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>JAWS2018</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Yes</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Windows® 10</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>10</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Chrome</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>121</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Multiple</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Support</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>NVDA (latest version)</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Yes</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Windows® 10</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>10</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Chrome</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Beta</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Multiple</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Support</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>N/A</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>N/A</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Chrome OS</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>121</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Chrome</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>121</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>1366 x 768 dp</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Support</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>ChromeVox</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Yes</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Mac</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>12.x (Monterey)</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Chrome</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>121</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Multiple</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Support</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>N/A</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>N/A</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Mac</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>12.x (Monterey)</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Safari</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>15.6</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Multiple</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Support</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>VoiceOver</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Yes</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>iPad iOS</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>17.3 (test with iPad 7th 17 in BrowserStack 810x1080)</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Safari</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>Default</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>= 768x1024 dp</td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
          <br />
        </section>

        <section id="additional-requirements" className="section" style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--sunlight)', fontWeight: 'bold' }}>Additional Requirements</h2>
          <ul>
            <li style={{ marginBottom: '10px' }}>Adobe® Reader® (latest version) and Microsoft® Excel® or other spreadsheet software is required for teacher and administrator accounts. Allow outgoing HTTPS/SSL communication to ealpha4.com through port 443.</li>
          </ul>
          
          <h3 style={{ color: 'var(--sunlight)' , fontWeight: 'bold'}}>Permitted URLs</h3>
          <p style={{ marginBottom: '10px' }}>Use the Permitted URLs list as a reference when configuring firewall and/or content filtering devices to allow access to the resources. View the full list.</p>
          
          <h3 style={{ color: 'var(--sunlight)', fontWeight: 'bold'}}>Internet Connection</h3>
          <p style={{ marginBottom: '10px' }}>A bandwidth speed of 1 Mbps per user is recommended for optimal performance on all ealpha and ealpha apps.</p>
          <p style={{ marginBottom: '10px' }}><strong>At School:</strong> The ealpha application is a modern web application; the user's web browser will cache ealpha for a period of 30 days or until a new version becomes available. It is estimated that an average of 12MB worth of data is transmitted per student per day. This estimate is based on a student usage session of seven page hits and downloading one content item.</p>
          <p style={{ marginBottom: '10px' }}><strong>At Home:</strong> Broadband via cable modem, DSL, or other high-speed Internet connection typically provides the recommended bandwidth. Check your web cache settings. When properly configured, web caching may result in improved performance.</p>
          
          <h3 style={{ color: 'var(--sunlight)', fontWeight: 'bold' }}>Additional Recommendations</h3>
          <ul>
            <li style={{ marginBottom: '10px' }}>Configure pop-up blockers to include *.ealpha4.com.com in the list of allowed sites. If in doubt, check with your school's technology department for the proper browser pop-up and security settings. Disabling pop-up blockers is not recommended.</li>
            <li style={{ marginBottom: '10px' }}>Enable JavaScript™ and cookies.</li>
          </ul>
          
          <h3 style={{ color: 'var(--sunlight)' , fontWeight: 'bold'}}>Product Specific Information</h3>
          <p style={{ marginBottom: '10px' }}>Auténtico users please note that assignments that require recording may not be completed on iPads.</p>
          <p style={{ marginBottom: '10px' }}>Currently, you must have access to a Windows-based PC computer/laptop or a Macintosh computer/laptop to use Answers & Solutions application.</p>
        </section>

        <footer className="footer" style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #ccc', paddingTop: '10px', backgroundColor: '#f1f1f1', padding: '20px' }}>
          {/* <p>E Alpha 4 | <a href="#" style={{ color: '#007bff' }}>License Agreement</a> | <a href="#" style={{ color: '#007bff' }}>Privacy Policy</a> | <a href="#" style={{ color: '#007bff' }}>Acknowledgments</a></p> */}
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Powered by eAlpha4tech Copyright © 2024 Alpha Publishing. All rights reserved.</p>
        </footer>
      </div>

      <StaticFooter />
    </>
  );
};

export default SystemRequirements;
