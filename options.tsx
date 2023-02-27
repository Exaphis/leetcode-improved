import {
  Box,
  ChakraProvider,
  Checkbox,
  Heading,
  Stack
} from "@chakra-ui/react";

import { useAutoRerun, useAutoStartTimer } from "~settings";

function OptionsIndex() {
  const [autoStartTimer, setAutoStartTimer] = useAutoStartTimer();
  const [autoRerun, setAutoRerun] = useAutoRerun();

  return (
    <ChakraProvider>
      <Box padding={5}>
        <Heading size="lg" marginBottom={5}>
          LeetCode Improved Settings
        </Heading>
        <Stack>
          <Checkbox
            isChecked={autoStartTimer}
            onChange={(e) => {
              setAutoStartTimer(e.target.checked);
            }}>
            Automatically start problem timer
          </Checkbox>
          <Checkbox
            isChecked={autoRerun}
            onChange={(e) => {
              setAutoRerun(e.target.checked);
            }}>
            Automatically rerun after rate limit
          </Checkbox>
        </Stack>
      </Box>
    </ChakraProvider>
  );
}

export default OptionsIndex;
