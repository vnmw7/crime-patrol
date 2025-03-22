import { render } from "@testing-library/react-native";
import Index from "../app/index";

test("index loads correctly", () => {
  const { getByTestId } = render(<Index />);
  const element = getByTestId("mainIndex");
  expect(element).toBeTruthy();
});
