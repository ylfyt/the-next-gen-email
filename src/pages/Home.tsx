import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { exitOutline } from 'ionicons/icons';
import './Home.css';
import { useEffect, useState } from 'react';
import { useRootContext } from '../contexts/root';
import { useHistory } from 'react-router';
import { signOut } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { IMail } from '../interfaces/mail';
import { CollectionReference, collection, getDocs, query, where } from 'firebase/firestore';
import Menu from '../components/menu';
import ComposeFab from '../components/Compose-fab';
import { IMessage, ISignedMessage } from '../interfaces/message';
import { suffleDecrypt } from '../algorithms/shuffle-aes';
import { Link } from 'react-router-dom';
import { parseMessage } from '../utils/parse-message';

const Home: React.FC = () => {
	const [mails, setMails] = useState<IMail[]>([]);
	const { user, loadingUser } = useRootContext();
	const history = useHistory();

	useEffect(() => {
		if (loadingUser || user) return;

		history.replace('login');
	}, [user, loadingUser]);

	const logout = () => {
		signOut(auth)
			.then(() => {
				history.replace('login');
			})
			.catch((error) => {
				console.log(error);
			});
	};

	useEffect(() => {
		if (!user) return;
		let mounted = true;

		(async () => {
			const mailCollection = collection(db, 'mail') as CollectionReference<IMail>;
			const snap = await getDocs(query(mailCollection, where('receiverId', '==', user.uid)));
			if (!mounted) return;

			const temp: IMail[] = [];
			snap.forEach((doc) => {
				temp.push({
					id: doc.id,
					...doc.data(),
				});
			});
			setMails(temp);
		})();

		return () => {
			mounted = false;
		};
	}, [user]);

	if (loadingUser || !user) return <div>Loading...</div>;

	return (
		<>
			<Menu />
			<IonPage id="menu">
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="start">
							<IonMenuButton></IonMenuButton>
						</IonButtons>
						<IonButtons slot="primary">
							<IonButton onClick={logout} color="danger">
								<IonIcon icon={exitOutline}></IonIcon>
							</IonButton>
						</IonButtons>
						<IonTitle>Next Email</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent fullscreen>
					<IonHeader collapse="condense">
						<IonToolbar>
							<IonTitle size="large">The Next Gen Email</IonTitle>
						</IonToolbar>
					</IonHeader>
					<div className="h-full flex flex-col items-center text-black mt-4 md:w-1/2 md:mx-auto">
						<div className="w-full text-sm text-left text-gray-500">
							<div className="text-xs text-gray-700 uppercase bg-gray-50 flex">
								
									<div className="px-6 py-3">
										Sender
									</div>
									<div className="px-6 py-3">
										Subject
									</div>
									<div className="px-6 py-3">
										Body
									</div>
									<div className="px-6 py-3">
										Sent date
									</div>
								
							</div>
							<div>
								{mails.map((mail, idx) => {
									let subject = 'Encrypted';
									let body = 'Encrypted';

									if (!mail.isEncrypted) {
                    const signed = parseMessage(mail.message)
										if (signed?.signature !== '') {
											// Checking signature
										} else {
											// const message = JSON.parse(signed.message) as IMessage;
											// subject = message.subject;
											// body = message.body;
										}
									} else {
										// TODO: DELETE THIS
										const msg = suffleDecrypt(mail.message, '1234567890abcdef');
										console.log(msg);
									}

									return (
										<Link key={idx} to={`/inbox/${mail.id}`} className={`bg-white border-b flex items-center ${mail.readAt ? '' : 'text-gray-900 font-bold'}`}>
											<div className="px-1 py-2">{mail.senderInfo?.email}</div>
											<div className="px-1 py-4">{subject}</div>
											<div className="px-1 py-4">{body}</div>
											<div className="px-1 py-4">{new Date(mail.createdAt).toLocaleString()}</div>
										</Link>
									);
								})}
							</div>
						</div>
					</div>
					<ComposeFab />
				</IonContent>
			</IonPage>
		</>
	);
};

export default Home;
