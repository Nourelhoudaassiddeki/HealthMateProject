import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@formspree/react';

const FormWrapper = styled.div`
  width: 60%;
  padding: 30px;
  float: right;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: rgb(8, 63, 37);
  margin-top: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid rgb(10, 173, 143);
  border-radius: 5px;
  outline: none;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid rgb(10, 173, 21);
  border-radius: 5px;
  outline: none;
  resize: none;
  height: 80px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: rgb(4, 44, 17);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: rgb(239, 238, 227);
    color: rgb(4, 44, 17);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  margin-top: 15px;
  border-radius: 5px;
  text-align: center;
`;

const InputSide = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  // Using Formspree's useForm hook with your form ID
  const [state, handleSubmit] = useForm("xovepdqn");

  // If form submission succeeded
  if (state.succeeded) {
    return (
      <FormWrapper>
        <SuccessMessage>
          <h3>Thank you for your message!</h3>
          <p>We've received your inquiry and will get back to you soon.</p>
          <SubmitButton onClick={() => navigate('/')}>Return to Home</SubmitButton>
        </SuccessMessage>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <form onSubmit={handleSubmit}>
        <Label>Name</Label>
        <Input 
          type="text" 
          name="name"
          placeholder="HealthMate" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Label>Email</Label>
        <Input 
          type="email" 
          name="email"
          placeholder="HealthMate@gmail.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Label>Phone</Label>
        <Input 
          type="tel" 
          name="phone"
          placeholder="+21269832377" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        
        <Label>Message</Label>
        <Textarea 
          name="message"
          placeholder="Write your message" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        
        <SubmitButton 
          type="submit" 
          disabled={state.submitting}
        >
          {state.submitting ? 'Sending...' : 'Send Message'}
        </SubmitButton>
      </form>
    </FormWrapper>
  );
};

export default InputSide;