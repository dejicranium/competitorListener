import { Stack, Table, Text, Title, useComponentState } from "@airplane/views";
import airplane from "airplane";
import { select } from "airplane/internal/prompt";

// Put the main logic of the view here.
// Views documentation: https://docs.airplane.dev/views/getting-started
const ExampleView = () => {
  const mentionState = useComponentState();
  const selectedMention = mentionState.selectedRow;

  return (
    <Stack>
      <Title>Competitor's Mentions</Title>
      <Text>
        An example view that showcases the summary of our competitors' mentions
        on Twitter
      </Text>
      <Table
        title="Competitor's Mentions"
        rowSelection="single"
        task="summarize_mentions"
      />
      {selectedMention && (
        <Table
          title={`${selectedMention.classification} Mentions for ${selectedMention.competitor}`}
          task={{
            slug: "filter_mentions",
            params: {
              competitor: selectedMention.competitor,
              classification: selectedMention.classification,
            },
          }}
        />
      )}
    </Stack>
  );
};

export default airplane.view(
  {
    slug: "list_mentions",
    name: "list_mentions",
  },
  ExampleView
);
