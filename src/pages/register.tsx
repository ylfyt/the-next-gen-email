import { IonContent, IonPage } from '@ionic/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FC, useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import LoadingButton from '../components/loading-button';

interface RegisterProps {}

const Register: FC<RegisterProps> = () => {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const history = useHistory();

	useEffect(() => {
		setLoading(false);
	}, []);

	const register = async () => {
		setLoading(true);
		createUserWithEmailAndPassword(auth, email, password)
			.then(() => {
				setLoading(false);
				history.replace('home');
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return (
		<IonPage>
			<IonContent fullscreen>
				<div className="h-full flex flex-col items-center text-black md:justify-center md:w-1/2 md:mx-auto">
					<div className="font-bold text-2xl mt-[50%] md:mt-0 mb-2">Register</div>
					<div className="flex flex-col w-full px-4 items-center mb-10">
						<input type="email" className="mb-2 min-h-[35px] rounded-lg py-2 px-3 w-full bg-[#eeeeee]" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
						<input type="password" className="mb-2 min-h-[35px] rounded-lg py-2 px-3 w-full bg-[#eeeeee]" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
						<LoadingButton loading={loading} disabled={!email || !password} onClick={register} className="bg-blue-500 w-[100px] min-h-[35px] rounded-lg">
							Submit
						</LoadingButton>
					</div>
					<div className="flex">
						Already have an account?
						<Link to="/login" className="ml-1 text-blue-500 underline" replace>
							Login
						</Link>
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default Register;
