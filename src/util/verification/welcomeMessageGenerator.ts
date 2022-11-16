const welcomeMessagesArray: string[] = [
	'Tell us what your favorite skin line is!',
	'Tell us what team you support!',
	'Tell us what video you came from!',
	'Tell us which you prefer from Phantom or Vandal!'];

export default function welcomeMessageGenerator(): string {
	return welcomeMessagesArray[Math.floor(Math.random() * welcomeMessagesArray.length)];
}
