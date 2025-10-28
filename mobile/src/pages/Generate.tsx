import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

const GeneratePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Generate</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Generate</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div
          className="ion-padding"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          <p className="ion-text-center" style={{ color: "#9CA3AF" }}>
            Generate page - Coming soon
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GeneratePage;
