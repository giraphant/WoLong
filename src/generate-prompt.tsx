import { ActionPanel, Action, Form, showToast, Toast, Clipboard, closeMainWindow } from "@raycast/api";
import { useState } from "react";
import { fetchMarketDataFromUrl } from "./lib/market-fetcher";
import { buildAnalysisPrompt } from "./lib/prompt-builder";

interface FormValues {
  marketUrl: string;
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: FormValues) {
    if (!values.marketUrl) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Please enter a market URL",
      });
      return;
    }

    setIsLoading(true);

    try {
      await showToast({
        style: Toast.Style.Animated,
        title: "Fetching market data...",
      });

      // Fetch market data
      const marketData = await fetchMarketDataFromUrl(values.marketUrl, {
        historyInterval: "1d",
        withBooks: true,
        withTrades: false,
      });

      // Generate prompt
      const prompt = buildAnalysisPrompt(marketData, values.marketUrl);

      // Copy to clipboard
      await Clipboard.copy(prompt);

      await showToast({
        style: Toast.Style.Success,
        title: "Success!",
        message: "Prompt copied to clipboard",
      });

      // Close Raycast window
      await closeMainWindow();
    } catch (error) {
      console.error("Error generating prompt:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to generate prompt",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Generate Prompt" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="marketUrl"
        title="Market URL"
        placeholder="https://polymarket.com/event/... or https://kalshi.com/markets/..."
        info="Enter a Polymarket or Kalshi prediction market URL"
      />
      <Form.Description
        title="Instructions"
        text="🔮 WoLong will generate a comprehensive analysis prompt and copy it to your clipboard. You can then paste it into Claude, ChatGPT, or Perplexity for deep market analysis."
      />
    </Form>
  );
}
