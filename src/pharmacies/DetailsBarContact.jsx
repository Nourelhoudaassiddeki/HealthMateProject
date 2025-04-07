import React from 'react';
import styled from 'styled-components';
import * as Icon from 'react-feather';

// Page Wrapper
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 10vh;
  background-color: #f8f8f8;
  padding: 50px 20px;
`;

// Contact Container (Flexbox for layout)
const ContactContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  width: 80%;
  max-width: 900px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

// Left Side: Contact Details
const DetailsBarWrapper = styled.div`
  background-color: rgb(8, 63, 10);
  border-radius: 10px;
  padding: 30px;
  width: 350px;
  color: white;
  text-align: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TextOne = styled.h3`
  font-size: 20px;
  font-weight: bold;
`;

const TextTwo = styled.p`
  font-size: 14px;
  margin-top: 5px;
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  margin-top: 15px;
  gap: 10px;

  &:hover {
    color: rgb(26, 139, 96);
  }
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;

const SocialIcon = styled.a`
  color: green;
  font-size: 20px;

  &:hover {
    color: rgb(40, 147, 109);
  }
`;


// Component
const DetailsBarContact = () => {
  return (
    <PageWrapper>
      <h2>Contact US</h2>
      <p>Any Question or remarks? Just write us a message</p>

      <ContactContainer>
        {/* Left: Contact Info */}
        <DetailsBarWrapper>
          <TextOne>Contact Information</TextOne>
          <TextTwo>Fill up the form and our team will get back to you within 24 hours</TextTwo>

          <ContactItem href="tel:+212681423135">
            <Icon.Phone size={18} />
            +212681423135
          </ContactItem>
          <ContactItem href="mailto:nourelhoudaassiddeki@gmail.com">
            <Icon.Mail size={18} />
        healthmate@gmail.com
          </ContactItem>

          {/* Social Icons */}
          <SocialIcons>
            <SocialIcon href="https://www.facebook.com/profile.php?id=100021937291259">
              <Icon.Facebook size={20} />
            </SocialIcon>
            <SocialIcon href="https://www.instagram.com/_allenjones/">
              <Icon.Instagram size={20} />
            </SocialIcon>
            <SocialIcon href="https://www.linkedin.com/in/allen-jones-b799b7171/">
              <Icon.Linkedin size={20} />
            </SocialIcon>
          </SocialIcons>
        </DetailsBarWrapper>

        

        
    
      </ContactContainer>
    </PageWrapper>
  );
};

export default DetailsBarContact;
