import Banner from "@images/staticPageImages/About-Us_Banner.jpg";
import Header from "@containers/header";



const PrivacyPolicy = () => {
  // const [htmlContent, setHtmlContent] = useState("");
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://www.ealpha.info/public/privacy-policy"
  //       ).then((resp) => resp.text());
  //       setHtmlContent(response);
  //     } catch (error: any) {
  //       toast("error", error || "Error");
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <div className="w-full h-full bg-white">
      <Header />
      {/* eslint-disable-next-line react/no-danger */}
      {/* <div dangerouslySetInnerHTML={{ __html: htmlContent }} /> */}
      <div className="flex flex-col min-h-screen bg-white">

        <img
          src={Banner}
          alt="contact us"
          className="h-24 md:h-auto w-full"
        />

        <div className="w-11/12  border-b pb-4 mb-6">
          <h2 className="text-3xl pl-10 pt-8 font-bold text-black">Privacy Policy</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-20">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">
              What information do we collect?
            </h3>
            <p className="text-md font-normal mb-4">
              We collect information from you when you register on our site,
              place an order, subscribe to our newsletter, respond to a survey,
              or fill out a form.
            </p>
            <p className="text-md font-normal mt-8">
            When ordering or registering on our site, as
              appropriate, you may be asked to enter your name or e-mail
              address. You may, however, visit our site anonymously.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">
              What do we use your information for?
            </h3>
            <p className="text-md mb-4">
              Any information we collect from you may be used in one of the
              following ways:
            </p>
            <ul className="list-disc pl-5 space-y-4">
              <li className="text-md">
                To personalize your experience (your information helps us to
                better respond to your individual needs)
              </li>
              <li className="text-md">
                To improve our website (we continually strive to improve our
                website offerings based on the information and feedback we
                receive from you)
              </li>
              <li className="text-md">
                To improve customer service (your information helps us to more
                effectively respond to your customer service requests and
                support needs).
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">Do we use cookies?</h3>
            <p className="text-md">
              Yes. Cookies are small files that a site or its service provider
              transfer to your computer’s hard drive through your web browser
              (if you allow) that enable the site or service provider’s systems
              to recognize your browser and capture and remember certain
              information.
            </p>
            <p className="text-md mt-4">
            We use cookies to understand and save your
            preferences for future visits.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">
              Do we disclose any information to outside parties?
            </h3>
            <p className="text-md">
              We do not sell, trade, or otherwise transfer to outside parties
              your personally identifiable information. This does not include
              trusted third parties who assist us in operating our website,
              conducting our business, or servicing you, so long as those
              parties agree to keep this information confidential. We may also
              release your information when we believe release is appropriate to
              comply with the law, enforce our site policies, or protect ours or
              others’ rights, property, or safety. However, non-personally
              identifiable visitor information may be provided to other parties
              for marketing, advertising, or other uses.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">Terms of Use</h3>
            <p className="text-md">
              Please also visit our Terms of Use section establishing the use,
              disclaimers, and limitations of liability governing the use of our
              app at <a className="text-blue-400" href="https://www.ealpha.info/public/terms-of-use">https://www.ealpha.info/public/terms-of-use).</a>
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">Your Consent</h3>
            <p className="text-md">
              By using our app, you consent to our online privacy policy.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">
              Changes to our Privacy Policy
            </h3>
            <p className="text-md">
              If we decide to change our privacy policy, we will post those
              changes on this page.
            </p>
          </div>
        </div>
        <div className="h-16" />
      </div>
    </div>
  );
};

export default PrivacyPolicy;
