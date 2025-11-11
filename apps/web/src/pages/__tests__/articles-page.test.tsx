import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/test/render-helper";
import { ArticlesPage } from "@/pages/articles-page";

vi.mock("@/api", () => ({
  getArticles: vi.fn().mockResolvedValue({ articles: [], pagination: { page:1, pageSize:12, totalPages: 0, total: 0 } }),
  getArticleCategories: vi.fn().mockResolvedValue(['General'])
}));

describe("ArticlesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders list and matches snapshot", async () => {
    const { findByText, container } = renderWithProviders(<ArticlesPage />);
    expect(await findByText("Health & Nutrition Library")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
