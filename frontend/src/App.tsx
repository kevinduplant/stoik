import React from "react";
import { Box, Heading, VStack, Text, Center } from "@chakra-ui/react";
import URLShortener from "./components/URLShortener";
import URLHistory from "./components/URLHistory";

const App: React.FC = () => {
  return (
    <Box p={5} backgroundColor={"#161b22"} color={"white"} fontFamily={"mono"}>
      <VStack spacing={8} width={["80%"]} mx="auto">
        <Heading as="h1" size="xl" mb={4}>
          <Center>Build stronger digital connections</Center>
        </Heading>
        <Text>
          <Center>
            Use our URL shortener and QR Codes to engage your audience and
            connect them to the right information.
          </Center>
        </Text>

        <URLShortener />
        <Text fontSize="2xl" mt={8}>
          URL History
        </Text>
        <URLHistory />
      </VStack>
    </Box>
  );
};

export default App;
