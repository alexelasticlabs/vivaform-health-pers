import { render, screen } from "@testing-library/react-native";

import HomeScreen from "./index";

describe("HomeScreen", () => {
  it("отображает CTA", () => {
    render(<HomeScreen />);
    expect(screen.getByText(/Открыть дневник/i)).toBeOnTheScreen();
  });
});