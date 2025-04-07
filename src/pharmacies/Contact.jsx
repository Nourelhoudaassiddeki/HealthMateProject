import React from 'react';
import styled from 'styled-components';
import DetailsBar from './DetailsBarContact';
import InputSide from './InputSide';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  background-color: white;
  padding-bottom: 50px;
`;

const PageHeadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 60px;
`;

const FormContainer = styled.div`
  width: 70%;
  background-color: #fff;
  padding: 5px;
  border-radius: 5px;
  height: 70vh;
  display: flex;
  @media (max-width: 768px) {
    width: 90%;
    height: auto;
    flex-direction: column;
  }
`;

const TextOne = styled.b`
  font-size: 30px;
  color: rgb(36, 164, 55);
  text-align: center;
`;

const TextTwo = styled.p`
  color: rgb(18, 138, 62);
  font-size: 15px;
  text-align: center;
`;

const Contact = () => {
  return (
    <PageWrapper>
      <PageHeadingWrapper>
        <TextOne>Contact US</TextOne>
        <TextTwo>Any Question or remarks? Just write us a message</TextTwo>
      </PageHeadingWrapper>
      <FormContainer>
        <DetailsBar />
        <InputSide />
      </FormContainer>
    </PageWrapper>
  );
};

export default Contact;
