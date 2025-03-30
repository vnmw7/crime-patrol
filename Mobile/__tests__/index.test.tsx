import { render } from "@testing-library/react-native";
import HomeScreen from "../app/(tabs)/index";

test("index loads correctly", () => {
  const { getByTestId } = render(<HomeScreen />);
  const element = getByTestId("mainIndex");
  expect(element).toBeTruthy();
});
