import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  Image,
  Link,
  Heading,
  FormLabel,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";

interface ShortenedURL {
  originalURL: string;
  shortenedURL: string;
  qrCode: string;
  createdAt: string;
}

const URLShortener: React.FC = () => {
  const [url, setUrl] = useState("");
  const [shortenedURL, setShortenedURL] = useState<ShortenedURL | null>(null);
  const [copyText, setCopyText] = useState("Copy");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const copyToClipboard = () => {
    if (!shortenedURL) {
      return;
    }

    navigator.clipboard
      .writeText(shortenedURL.shortenedURL)
      .then(() => {
        setCopyText("Copied!");
        toast({
          title: "Link Copied",
          description: "The shortened link has been copied to your clipboard.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => setCopyText("Copy"), 3000); // Reset copy text after 3 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/shorten", {
        url,
      });

      const newShortenedURL: ShortenedURL = {
        originalURL: url,
        shortenedURL: response.data.shortUrl,
        qrCode: response.data.qrCode,
        createdAt: new Date().toISOString(),
      };

      setIsLoading(false);
      setShortenedURL(newShortenedURL);
      setCopyText("Copy");

      const history = JSON.parse(localStorage.getItem("urlHistory") || "[]");

      if (
        !history.some(
          (url: ShortenedURL) =>
            newShortenedURL.shortenedURL === url.shortenedURL
        )
      ) {
        history.push(newShortenedURL);
        localStorage.setItem("urlHistory", JSON.stringify(history));
      }

      toast({
        title: "Success",
        description: "URL shortened successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to shorten URL",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="0px"
      background={"white"}
      borderRadius={"md"}
      width={["80%"]}
      color={"black"}
    >
      <VStack spacing={4} as="form" onSubmit={handleSubmit}>
        <Heading as="h2" size="lg">
          Shorten a long link
        </Heading>
        <FormLabel htmlFor="url">Paste your long link here</FormLabel>
        <Input
          type="url"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit" colorScheme="teal" size="md">
          Get your link for free
        </Button>
        {isLoading && <Spinner />}
        {shortenedURL && (
          <Box width={["100%"]} mt={4}>
            <Heading as="h3" size="md" mt={4}>
              Here is your short URL and QR Code
            </Heading>
            <HStack spacing={2}>
              <Text>
                <Link
                  href={shortenedURL.shortenedURL}
                  isExternal
                  color={"teal.500"}
                >
                  {shortenedURL.shortenedURL}
                </Link>
              </Text>
              <Button
                verticalAlign={"middle"}
                colorScheme="teal"
                variant="outline"
                onClick={copyToClipboard}
                mt={2}
              >
                {copyText}
              </Button>
            </HStack>

            <Image
              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                shortenedURL.qrCode
              )}`}
              alt="QR Code"
              boxSize="200px"
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default URLShortener;
