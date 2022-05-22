import React from 'react';
// import SignIn from '../components/auth/SignIn';
// import SignUp from '../components/auth/SignUp';
import TokenAuth from '../components/auth/TokenAuth';

import { FixMeLater } from '../fixMeLater';

type LoginProps = {
  setAccount: FixMeLater;
};

function LoginPage({ setAccount }: LoginProps): JSX.Element {
  // const [isSignUp, setIsSignUp] = useState(false);

  // const signUpFunc = (): void => {
  //   setIsSignUp(!isSignUp);
  // };

  return (
    <div className="loginPage">
      {/* {isSignUp ? (
        <SignUp signUpFunc={signUpFunc} setAccount={setAccount} />
      ) : (
        <SignIn signUpFunc={signUpFunc} setAccount={setAccount} />
      )} */}
      <TokenAuth setAccount={setAccount} />

      <div className="signinFooter" />
    </div>
  );
}

export default LoginPage;
