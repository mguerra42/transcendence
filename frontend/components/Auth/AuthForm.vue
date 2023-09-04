<!-- AUTH FORM COMPONENT-->
<!-- Handles signup and login with conditional render-->

<template>
	<div v-if="!authSuccess">
	<!-- IF SIGNUP FORM -->
		<div v-if="!showLoginForm" class="w-80 h-105 bg-white p-6 rounded-lg">
			<h1 class="text-black text-2xl">First time ? 😄</h1>
			<h1 class="text-gray text-2ml mb-6">Create your account !</h1>
			<form @submit.prevent="sendSignupRequest" class="flex flex-col space-y-4">
				<input
					type="text"
					v-model="signupUsername"
					placeholder="Username"
					class="rounded-lg px-3 py-2 text-black"
				/>
				<input
					type="email"
					v-model="signupEmail"
					placeholder="Email"
					class="rounded-lg px-3 py-2 text-black"
				/>
				<input
					type="password"
					v-model="signupPassword"
					placeholder="Password"
					class="rounded-lg px-3 py-2 text-black"
				/>
				<button
					type="submit"
					:disabled="!isValidSignupForm"
					:class="{
						'bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition duration-300': isValidSignupForm,
						'bg-blue-300 text-white rounded-lg px-4 py-2': !isValidSignupForm,
					}"
				>
					Sign Up
				</button>
				<h1 class="text-gray text-2s flex justify-center" >or</h1>
				<a
					href="#"
					class="text-blue-500 hover:text-blue-600 flex justify-center"
					@click="showLoginForm = true"
				>
					Log In
				</a>
				<!-- Add login button and other login form fields here -->
			</form>
		</div>

	<!-- ELSE LOGIN FORM-->
		<div v-else class="w-80 h-80 bg-white p-6 rounded-lg">
			<h1 class="text-black text-2xl">Welcome Back ! 😊</h1>
			<h1 class="text-gray text-2xl mb-6">Log In to Your Account</h1>
		<form @submit.prevent="sendLoginRequest" class="flex flex-col space-y-4">
			<input
				type="text"
				v-model="loginUsername"
				placeholder="Username"
				class="rounded-lg px-3 py-2 text-black"
			/>
			<input
				type="password"
				v-model="loginPassword"
				placeholder="Password"
				class="rounded-lg px-3 py-2 text-black"
				/>
				<button
					type="submit"
					:disabled="!isValidLoginForm"
					:class="{
						'bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition duration-300': isValidLoginForm,
						'bg-blue-300 text-white rounded-lg px-4 py-2': !isValidLoginForm,
					}"
				>
					Log In
				</button>
			</form>
			</div>
		</div>
		<div v-else class="w-70 h-45 bg-white p-6 rounded-lg flex flex-col items-center">
				<h1 class="text-black text-2xl py-4">Welcome {{sessionUsername}}! </h1>
				<button @click="logout" class="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition duration-300">
					Log Out
				</button>
		</div>
</template>  

<script>
export default {
	name: 'SignupForm',
	data() {
			return {

					sessionUsername : '',

					signupEmail: '',
					signupUsername: '',
					signupPassword: '',

					loginUsername: '',
					loginPassword: '',

					showLoginForm: false,
					authSuccess: false,
			};
	},
	computed: {
		isValidSignupForm() {
			return this.signupUsername !== '' && this.signupEmail !== '' && this.signupPassword !== '';
		},
		isValidLoginForm() {
			return this.loginUsername !== '' && this.loginPassword !== '';
		},
	},
	methods: {
		async sendSignupRequest() {
			try {
				if (this.signupEmail === '' || this.signupPassword === '' || this.signupUsername === '') {
						console.log("Empty email, username, or password");
						return;
				}
				// useClient().auth.login();
				const response = await useFetch('http://localhost:3001/api/v0/signup', {
						method: 'POST',
						headers: {
								'Content-Type': 'application/json',
						},
						body: JSON.stringify({
								email: this.signupEmail,
								password: this.signupPassword,
								username: this.signupUsername,
						})
				});
				console.log(response.data.value.body);
				if (response.data.value.status == 200)
				{
					this.authSuccess = true;
					this.sessionUsername = this.signupUsername;
				}
			} catch (error) {
				console.error('Error:', error);
			}
		},
		async sendLoginRequest() {
			try {
				if (this.loginPassword === '' || this.loginUsername === '') {
						console.log("Empty email, username, or password");
						return;
				}
				useClient().auth.login('hi', 'brother');
				const response = await useFetch('http://localhost:3001/api/v0/login', {
						method: 'POST',
						headers: {
								'Content-Type': 'application/json',
						},
						body: JSON.stringify({
								password: this.loginPassword,
								username: this.loginUsername,
						})
				});
				console.log(response.data.value.body);
				if (response.data.value.status == 200)
				{
					this.authSuccess = true;
					this.sessionUsername = this.loginUsername;
				}
			} catch (error) {
				console.error('Error:', error);
			}
		},
		logout()
		{
			this.sessionUsername = '';
			this.signupEmail ='';
			this.signupUsername = '';
			this.signupPassword = '';
			this.loginUsername = '';
			this.loginPassword = '';
			this.showLoginForm = false;
			this.authSuccess =false;
			//implement proper logout logic
		}
	},
};
</script>
