import { ScreenContainer, ScreenHeader } from '@/components/common';
import { ScrollView, Text, View } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScreenContainer safeArea>
      <View className="px-6 flex-1">
        <ScreenHeader title="Privatlivspolitik" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text className="text-white text-base leading-6 mb-4">
            Senest opdateret: {new Date().toLocaleDateString('da-DK')}
          </Text>

          <Section title="1. Introduktion">
            Vi tager din databeskyttelse alvorligt. Denne privatlivspolitik beskriver, hvordan Challenger ("vi", "os" eller "vores") indsamler, bruger og beskytter dine personoplysninger, når du bruger vores mobilapplikation.
          </Section>

          <Section title="2. Data vi indsamler">
            Vi kan indsamle følgende typer af oplysninger:
            {'\n\n'}• Personlige oplysninger: Navn, e-mailadresse, profilbillede, alder og sportsinteresser, som du giver os ved oprettelse af din profil.
            {'\n'}• Brugsdata: Oplysninger om, hvordan du bruger appen, herunder dine hold, kampe og interaktioner.
            {'\n'}• Lokationsdata: Hvis du giver tilladelse, kan vi bruge din lokation til at finde sportsbegivenheder i nærheden.
          </Section>

          <Section title="3. Brug af dine oplysninger">
            Vi bruger dine oplysninger til at:
            {'\n\n'}• Levere og vedligeholde vores tjeneste.
            {'\n'}• Administrere din konto og give dig kundesupport.
            {'\n'}• Facilitere oprettelse af hold og kampe.
            {'\n'}• Kommunikere med dig om opdateringer og nyheder.
          </Section>

          <Section title="4. Deling af data">
            Vi sælger ikke dine personlige data til tredjeparter. Vi kan dele data med tjenesteudbydere, der hjælper os med at drive appen (f.eks. hosting og database), underlagt fortrolighedsaftaler.
          </Section>

          <Section title="5. Dine rettigheder">
            Du har ret til at:
            {'\n\n'}• Få indsigt i de oplysninger, vi har om dig.
            {'\n'}• Anmode om rettelse eller sletning af dine oplysninger.
            {'\n'}• Trække dit samtykke tilbage.
            {'\n\n'}Kontakt os venligst, hvis du ønsker at udøve disse rettigheder.
          </Section>

          <Section title="6. Kontakt">
            Hvis du har spørgsmål til denne privatlivspolitik, kan du kontakte os på support@challenger.dk.
          </Section>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="text-white text-lg font-bold mb-2">{title}</Text>
    <Text className="text-[#9CA3AF] text-base leading-6">{children}</Text>
  </View>
);
