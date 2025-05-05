import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Link,
} from "@chakra-ui/react";

interface ShortenedURL {
  originalURL: string;
  shortenedURL: string;
  qrCode: string;
  createdAt: string;
}

const URLHistory: React.FC = () => {
  const history = JSON.parse(localStorage.getItem("urlHistory") || "[]");

  return (
    <Box p={5} shadow="md" borderWidth="1px" width={["100%"]}>
      <Table variant="interactive" size="sm">
        <Thead>
          <Tr>
            <Th>Original URL</Th>
            <Th>Short URL</Th>
            <Th>QR Code</Th>
            <Th>Created At</Th>
          </Tr>
        </Thead>
        <Tbody>
          {history.reverse().map((item: ShortenedURL, index: number) => (
            <Tr key={index}>
              <Td>{item.originalURL}</Td>
              <Td>
                <Link href={item.shortenedURL} isExternal>
                  {item.shortenedURL}
                </Link>
              </Td>
              <Td>
                <Image
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(
                    item.qrCode
                  )}`}
                  alt="QR Code"
                  boxSize="200px"
                />
              </Td>
              <Td>{new Date(item.createdAt).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default URLHistory;
