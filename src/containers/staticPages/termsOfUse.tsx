import RouteLayout from '@layout/routeLayout';
import React from 'react';
import Banner from '@images/staticPageImages/About-Us_Banner.jpg';
import StaticHeader from './staticHeader';
import StaticFooter from './staticFooter';

export default function TermsOfUse() {
  return (
    <RouteLayout navBack={false}>
      <StaticHeader />
      <div className="staticPages">
        <img src={Banner} alt="contact us" className="h-24 mt-24 md:h-auto w-full" />
        <h2 className="text-3xl my-4 pl-5">Term of Use</h2>
        <hr />
        <div className="px-12 py-4 space-y-4">
          <p className="text-gray-800">
            The ealpha4.com website the Site is an online information service provided by ealpha4.com
            {' '}
            <a href="https://ealpha4.com">(https://ealpha4.com)</a>
            , subject to your compliance with the terms and conditions set forth below.
          </p>
          <p className="py-4 text-gray-800">
            Please read the Terms of Use carefully before you start to use the Site. By using the Site, you agree to be bound by the terms and conditions set forth below. If you do not wish to be bound by these terms and conditions, you may not access or use the Site. The Site may modify this agreement at any time, and such modifications shall be effective immediately upon posting of the modified agreement on the Site. You agree to review the agreement periodically to be aware of such modifications, and your continued access or use of the Site shall be deemed your conclusive acceptance of the modified agreement.
          </p>
          <div>
            <h3 className="font-semibold mb-2">1. Copyright, Licenses, and Idea Submissions</h3>
            <p className="text-gray-800">The entire contents of the Site are protected by international copyright and trademark laws. The owner of the copyrights and trademarks are ealpha4.com, its affiliates, or other third-party licensors. You may not modify, copy, reproduce, republish, upload, post, transmit, or distribute, in any manner, the material on the Site, including text, graphics, code and/or software.</p>
            <p className="pt-2 text-gray-800">
              You may print and download portions of the material from the different areas of the Site solely for your own non-commercial use, provided that you agree not to change or delete any copyright or proprietary notices from the materials. You agree to grant to ealpha4.com a non-exclusive, royalty-free, worldwide, perpetual license, with the right to sub-license, to reproduce, distribute, transmit, create derivative works of, publicly display and publicly perform any materials and other information (including, without limitation, ideas contained therein for new or improved products and services) you submit to any public areas of the Site (such as bulletin boards, forums, and newsgroups) or by email to ealpha4.com by all means and in any media now known or hereafter developed. You also grant the Site permission to use your name in connection with the submitted materials and other information, as well as in connection with all advertising, marketing and promotional material related thereto. You agree that you shall have no recourse against the Site for any alleged or actual infringement or misappropriation of any proprietary right in your communications to ealpha4.com.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Trademarks</h3>
            <p className="text-gray-800">Publications, products, content or services referenced herein or on the Site are the exclusive trademarks or service marks of ealpha4.com. Other product and company names mentioned on the Site may be the trademarks of their respective owners.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Use of the Site</h3>
            <p className="text-gray-800">You understand that, except for information, products, or services clearly identified as being supplied by the Site, ealpha4.com does not operate, control, or endorse any information, products, or services on the internet in any way. Except for the Site-identified information, any products and services offered through the Site, or on the internet generally, are offered by third parties that are not affiliated with the Site. You also understand that the Site cannot, and does not, guarantee or warrant that files available for downloading through the Site will be free of infection or viruses, worms, Trojan horses, or other code that manifests contaminating or destructive properties. You are responsible for implementing sufficient procedures and checkpoints to satisfy your particular requirements for accuracy of data input and output, and for maintaining a means external to the Site for the reconstruction of any lost data.</p>
            <p className="pt-2 text-gray-800">You assume total responsibility and risk for your use of the Site and the internet. The Site provides related information as is, and does not make any express or implied warranties, representations or endorsements whatsoever (including, without limitation, warranties of title or non-infringement, or the implied warranties of merchantability or fitness for a particular purpose) with regard to the service, any merchandise information, or service provided through the service or on the internet generally, and the Site shall not be liable for any cost or damage arising either directly or indirectly from any such transaction. It is solely your responsibility to evaluate the accuracy, completeness and usefulness of all opinions, advice, services, merchandise and other information provided through the service, or on the internet generally. The Site does not warrant that the service will be uninterrupted or error-free or that defects in the service will be corrected.</p>
            <p className="pt-2 text-gray-800">You understand further that the pure nature of the internet contains unedited materials, some of which are sexually explicit or may be offensive to you. Your access to such materials is at your risk. ealpha4.com has no control over, and accepts no responsibility whatsoever for, such materials.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Limitation of Liability</h3>
            <p className="text-gray-800">In no event will the Site be liable for (i) any incidental, consequential, or indirect damages (including, but not limited to, damages for loss of profits, business interruption, loss of programs or information, and the like) arising out of the use of or inability to use the Site, or any information, or transactions provided on the Site, or downloaded from the service, or any delay of such information or service, even if the Site or its authorized representatives have been advised of the possibility of such damages; or (ii) any claim attributable to errors, omissions, or other inaccuracies in the Site and/or materials or information downloaded through the Site.</p>
            <p className="pt-2 text-gray-800">The Site makes no representations whatsoever about any other website which you may access through this one, or which may link to this Site. When you access a non-ealpha4.com website, please understand that it is independent from the Site and has no control over the content on that website. In addition, a link to the Site does not mean that the Site endorses or accepts any responsibility for the content, or the use, of such website.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. Indemnification</h3>
            <p className="text-gray-800">You agree to indemnify, defend and hold harmless ealpha4.com, its officers, directors, employees, agents, licensors, suppliers, and any third party information providers to the Service from and against all losses, expenses, damages and costs, including reasonable attorneys fees, resulting from any violation of this Agreement (including negligent or wrongful conduct) by you or any other person accessing the service.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">4. Third-Party Rights</h3>
            <p className="text-gray-800">The provisions of paragraphs (2) Use of the Site, and (3) Indemnification are for the benefit of ealpha4.com and its officers, directors, employees, agents, licensors, suppliers, and any third-party information providers to the Site. Each of these individuals or entities shall have the right to assert and enforce those provisions directly against you on its own behalf.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">5. Term; Termination</h3>
            <p className="text-gray-800">This Agreement may be terminated by either party without notice at any time for any reason. The provisions of paragraphs (1) Copyright, Licenses, and Idea Submissions; (2) Use of the Site; (3) Indemnification; (4) Third-Party Rights; and (6) Miscellaneous, shall survive any termination of this Agreement.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">6. Miscellaneous</h3>
            <p className="text-gray-800">This Agreement shall all be governed and construed in accordance with the laws of the United Kingdom applicable to agreements made and to be performed in the United Kingdom. You agree that any legal action or proceeding between https://ealpha4.com and you for any purpose concerning this Agreement or the parties obligations hereunder shall be brought exclusively in a court of competent jurisdiction sitting in the United Kingdom. Any cause of action or claim you may have with respect to the Site must be commenced within one (1) year after the claim or cause of action arises, or such claim or cause of action is barred. ealpha4.com failure to insist upon or enforce strict performance of any provision of this Agreement shall not be construed as a waiver of any provision or right. Neither the course of conduct between the parties nor trade practice shall act to modify any provision of this Agreement. ealpha4.com may assign its rights and duties under this Agreement to any party at any time without notice to you.</p>
          </div>
          <p className="mt-6 text-gray-800">Any rights not expressly granted herein are reserved.</p>
        </div>
      </div>
      <StaticFooter />
    </RouteLayout>
  );
}
