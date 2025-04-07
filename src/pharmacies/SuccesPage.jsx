import React from "react";
import * as Icon from "react-feather";
import { motion } from "framer-motion";
import styled from "styled-components";

const MessageWrapper = styled.div`
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const SuccessMessage = styled.h2`
  font-size: 25px;
  color: rgb(8, 8, 63);
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const InfoMessage = styled.p`
  font-size: 18px;
  color: rgb(0, 0, 0);
  margin-top: 10px;
  text-align: center;
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const PhoneNumber = styled.p`
  font-size: 20px;
  color: rgb(34, 139, 34);
  margin-top: 10px;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const SuccessPage = ({ phoneNumber }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <MessageWrapper>
        <Icon.CheckCircle color="rgb(8, 8, 63)" style={{ width: 50, height: 50 }} />
        <SuccessMessage>RESERVATION MADE SUCCESSFULLY</SuccessMessage>
        <InfoMessage>Your order will be delivered within 24 hours. If there is any delay, please contact the delivery number below.</InfoMessage>
        {phoneNumber && <PhoneNumber>Contact: {phoneNumber}</PhoneNumber>}
      </MessageWrapper>
    </motion.div>
  );
};

export default SuccessPage;
