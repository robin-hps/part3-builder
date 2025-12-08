import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import { generateSVGString } from './svg-generator';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Card from '@commercetools-uikit/card';

// Basic theme fallback if needed, though usually handled by css-vars or context
// UI Kit often expects a theme provider or globals
// We will wrap with IntlProvider as required.

function App() {
  const [inputText, setInputText] = useState<string>(`Terms and conditions Day Ticket Dog

- The Day Ticket Dog is a ticket that allows a dog that is not transported in a basket, bag, cage or on your lap, to travel unlimitedly on the trains of NS and other train operators within the Netherlands. This also includes the Intercity direct and the domestic routes of the Intercity Berlin, Intercity Brussels and the ICE International. The Day Ticket Dog is not valid on the Nightjet and Eurostar.
- The Day Ticket Dog is only valid in combination with a valid ticket from the traveler himself. Upon inspection, the personal details on the Day Ticket Dog must match those of the traveler with whom the dog is traveling.
- The Day Ticket Dog is valid all day on the date indicated on the ticket from 00:00 am to 04:00 am the following morning, including rush hour.
- Dogs are not allowed on train replacement transport, such as coaches and NS buses, with the exception of assistance dogs.
- View all terms and conditions of the Day Ticket Dog via www.ns.nl/conditions-individual-tickets`);

  const [svgOutput, setSvgOutput] = useState<string>('');

  const handleGenerate = () => {
    const rawLines = inputText.split('\n').filter(l => l.trim() !== '');
    if (rawLines.length === 0) return;

    const header = rawLines[0];
    const bulletLines = rawLines.slice(1).map(line => line.replace(/^-\s*/, '').trim());

    const svg = generateSVGString(header, bulletLines);
    setSvgOutput(svg);
  };

  const handleDownload = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'part3-ticket.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <IntlProvider locale="en">
      <div className="min-h-screen bg-gray-100 p-8 font-sans">
        <Spacings.Stack scale="xl">
          <Text.Headline as="h1">Commercetools Part 3 Builder</Text.Headline>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <Spacings.Stack scale="m">
                <Text.Subheadline as="h4">Content Editor</Text.Subheadline>
                <Text.Body>
                  Enter the text below. The first line is the header. Lines starting with "- " are bullet points.
                </Text.Body>

                <Spacings.Stack scale="s">
                  <label className="font-bold text-sm">Input Text</label>
                  <MultilineTextInput
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    placeholder="Enter your terms here..."
                  />
                </Spacings.Stack>

                <PrimaryButton
                  label="Generate Preview"
                  onClick={handleGenerate}
                />
              </Spacings.Stack>
            </Card>

            <Card>
              <Spacings.Stack scale="m">
                <div className="flex justify-between items-center">
                  <Text.Subheadline as="h4">Live Preview</Text.Subheadline>
                  <SecondaryButton
                    label="Download SVG"
                    onClick={handleDownload}
                    isDisabled={!svgOutput}
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded p-4 flex items-center justify-center min-h-[400px]">
                  {svgOutput ? (
                    <div dangerouslySetInnerHTML={{ __html: svgOutput }} className="shadow-lg bg-white max-w-full" />
                  ) : (
                    <Text.Detail tone="secondary">Click "Generate Preview" to render the ticket</Text.Detail>
                  )}
                </div>
              </Spacings.Stack>
            </Card>
          </div>
        </Spacings.Stack>
      </div>
    </IntlProvider>
  );
}

export default App;
