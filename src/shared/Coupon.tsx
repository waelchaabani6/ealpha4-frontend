const Coupon = () => (
  <div
    className="h-36 py-8 bg-[url('@images/smicons/discount_bg.svg')] bg-cover
            flex flex-col lg:flex-row justify-center items-center px-4 sm:px-10 gap-x-2 relative"
  >
    <div>
      <div className="w-max font-light text-xl">
        <p>
          Alpha Publishing is offering you a
          {' '}
          <span className="text-accent font-semibold">5% discount on</span>
        </p>
        <p className="text-sunlight font-semibold text-xl text-center">
          LanguageCert Test of English (LTE)
        </p>
      </div>
    </div>
    {/* Footer */}
    <div className="h-full flex text-sm drop-shadow-lg ml-5">
      <div
        className="h-full w-60 p-2 flex flex-col items-center
                  justify-center rounded-2xl border-dashed border-2
              border-accent font-light text-center"
      >
        <p>Click here to apply and </p>
        <p>use this promo code</p>
      </div>
      <p
        className="h-full p-2 text-xs text-center rounded-xl font-extrabold bg-accent
                truncate uppercase transform rotate-180 text-white"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        dsdfsdf
      </p>
    </div>
  </div>
);

export default Coupon;
