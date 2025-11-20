import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
} from "@react-email/components";

const FeedbackEmailTemplate = ({
  name,
  email,
  feedback,
  rating,
}: {
  name: string;
  email: string;
  feedback: string;
  rating: number;
}) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://i.imgur.com/wqXcq0D.png"
              alt="Truth Whisperer"
              style={logo}
            />
          </Section>

          <Hr style={hr} />

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>New Feedback Received</Heading>
            <Text style={text}>
              Someone has shared their feedback about your application.
            </Text>

            <Section style={messageCard}>
              <Text style={label}>👤 Name:</Text>
              <Text style={value}>{name}</Text>

              <Text style={label}>📧 Email:</Text>
              <Text style={value}>
                <a href={`mailto:${email}`} style={emailLink}>
                  {email}
                </a>
              </Text>

              <Text style={label}>⭐ Rating:</Text>
              <Text style={value}>
                {"⭐".repeat(rating)} ({rating}/5)
              </Text>

              <Hr style={hr} />

              <Text style={label}>💬 Feedback:</Text>
              <Section style={messageBox}>
                <Text style={messageText}>{feedback}</Text>
              </Section>
            </Section>

            <Text style={footer}>
              This feedback was submitted at {new Date().toLocaleDateString()}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const logo = {
  margin: "0 auto",
  borderRadius: "4px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const content = {
  padding: "20px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const messageCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "24px",
  margin: "20px 0",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 8px 0",
};

const value = {
  fontSize: "16px",
  color: "#1f2937",
  margin: "0 0 16px 0",
  wordBreak: "break-word" as const,
};

const emailLink = {
  color: "#3b82f6",
  textDecoration: "none",
};

const messageBox = {
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  padding: "16px",
  marginTop: "8px",
};

const messageText = {
  fontSize: "15px",
  color: "#374151",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  textAlign: "center" as const,
  marginTop: "32px",
  paddingTop: "20px",
  borderTop: "1px solid #e6ebf1",
};

export default FeedbackEmailTemplate;
