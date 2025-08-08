import React from 'react';
//@ts-ignore
import friendConvert from '../../../../assets/img/friendConvert.png';
import './login.css';

interface LoginProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  page: string;
  setPage: (page: string) => void;
}

function login({ isLoggedIn, setIsLoggedIn, page, setPage }: LoginProps) {
  const [inputText, setInputText] = React.useState('');

  return (
    <div className="login-container">
      <img
        src={friendConvert}
        alt="Friend Convert Logo"
        className="login-logo"
      />
      <h1 className="login-title">Welcome to Friend Convert</h1>
      <p className="login-description">
        Want to build targetted audience on Facebook, save time and get more
        sales?
      </p>
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault(); // Prevent default form submission
          // Handle login logic here
          console.log('Login button clicked');
          if (inputText.trim() === 'WEMA1EK1AMB2SNRB') {
            // Simulate successful login
            // setIsLoggedIn(true);
            setPage('home');
          } else {
            console.log('Invalid license key');
          }
        }}
      >
        <input
          type="text"
          placeholder="License Key"
          className="lisense-input"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            chrome.storage.local.set({ licenseKey: e.target.value });
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              setInputText(inputText);
            }
          }}
          required
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
}

export default login;
