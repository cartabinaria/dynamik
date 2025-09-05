import { toast as svelteToast } from '@zerodevx/svelte-toast';

// Theme colors interface
interface ThemeColors {
	success: {
		bg: string;
		text: string;
		bar: string;
	};
	error: {
		bg: string;
		text: string;
		bar: string;
	};
	warning: {
		bg: string;
		text: string;
		bar: string;
	};
	info: {
		bg: string;
		text: string;
		bar: string;
	};
}

// Get DaisyUI theme colors by creating temporary elements
function getThemeColors(): ThemeColors {
	// Create temporary elements to get DaisyUI theme colors
	const tempSuccess = document.createElement('div');
	tempSuccess.className = 'bg-success text-success-content';
	tempSuccess.style.position = 'absolute';
	tempSuccess.style.visibility = 'hidden';
	document.body.appendChild(tempSuccess);
	
	const tempError = document.createElement('div');
	tempError.className = 'bg-error text-error-content';
	tempError.style.position = 'absolute';
	tempError.style.visibility = 'hidden';
	document.body.appendChild(tempError);
	
	const tempWarning = document.createElement('div');
	tempWarning.className = 'bg-warning text-warning-content';
	tempWarning.style.position = 'absolute';
	tempWarning.style.visibility = 'hidden';
	document.body.appendChild(tempWarning);
	
	const tempInfo = document.createElement('div');
	tempInfo.className = 'bg-info text-info-content';
	tempInfo.style.position = 'absolute';
	tempInfo.style.visibility = 'hidden';
	document.body.appendChild(tempInfo);
	
	// For bar colors, use content colors for better contrast
	const tempSuccessBar = document.createElement('div');
	tempSuccessBar.className = 'bg-success-content';
	tempSuccessBar.style.position = 'absolute';
	tempSuccessBar.style.visibility = 'hidden';
	document.body.appendChild(tempSuccessBar);
	
	const tempErrorBar = document.createElement('div');
	tempErrorBar.className = 'bg-error-content';
	tempErrorBar.style.position = 'absolute';
	tempErrorBar.style.visibility = 'hidden';
	document.body.appendChild(tempErrorBar);
	
	const tempWarningBar = document.createElement('div');
	tempWarningBar.className = 'bg-warning-content';
	tempWarningBar.style.position = 'absolute';
	tempWarningBar.style.visibility = 'hidden';
	document.body.appendChild(tempWarningBar);
	
	const tempInfoBar = document.createElement('div');
	tempInfoBar.className = 'bg-info-content';
	tempInfoBar.style.position = 'absolute';
	tempInfoBar.style.visibility = 'hidden';
	document.body.appendChild(tempInfoBar);
	
	const successComputedStyle = getComputedStyle(tempSuccess);
	const errorComputedStyle = getComputedStyle(tempError);
	const warningComputedStyle = getComputedStyle(tempWarning);
	const infoComputedStyle = getComputedStyle(tempInfo);
	const successBarStyle = getComputedStyle(tempSuccessBar);
	const errorBarStyle = getComputedStyle(tempErrorBar);
	const warningBarStyle = getComputedStyle(tempWarningBar);
	const infoBarStyle = getComputedStyle(tempInfoBar);
	
	const successBg = successComputedStyle.backgroundColor;
	const successText = successComputedStyle.color;
	const successBar = successBarStyle.backgroundColor;
	const errorBg = errorComputedStyle.backgroundColor;
	const errorText = errorComputedStyle.color;
	const errorBar = errorBarStyle.backgroundColor;
	const warningBg = warningComputedStyle.backgroundColor;
	const warningText = warningComputedStyle.color;
	const warningBar = warningBarStyle.backgroundColor;
	const infoBg = infoComputedStyle.backgroundColor;
	const infoText = infoComputedStyle.color;
	const infoBar = infoBarStyle.backgroundColor;
	
	// Clean up
	document.body.removeChild(tempSuccess);
	document.body.removeChild(tempError);
	document.body.removeChild(tempWarning);
	document.body.removeChild(tempInfo);
	document.body.removeChild(tempSuccessBar);
	document.body.removeChild(tempErrorBar);
	document.body.removeChild(tempWarningBar);
	document.body.removeChild(tempInfoBar);
	
	return {
		success: {
			bg: successBg || 'rgba(72,187,120,0.9)',
			text: successText || 'mintcream',
			bar: successBar || '#2F855A'
		},
		error: {
			bg: errorBg || 'rgba(244,67,54,0.9)',
			text: errorText || 'mintcream', 
			bar: errorBar || '#E74C3C'
		},
		warning: {
			bg: warningBg || 'rgba(245,158,11,0.9)',
			text: warningText || 'mintcream',
			bar: warningBar || '#D97706'
		},
		info: {
			bg: infoBg || 'rgba(59,130,246,0.9)',
			text: infoText || 'mintcream',
			bar: infoBar || '#2563EB'
		}
	};
}

// Create toast object with themed methods
export const toast = {
	success: (message: string) => {
		const colors = getThemeColors();
		svelteToast.push(message, {
			theme: {
				'--toastColor': colors.success.text,
				'--toastBackground': colors.success.bg,
				'--toastBarBackground': colors.success.bar
			}
		});
	},
	
	error: (message: string) => {
		const colors = getThemeColors();
		svelteToast.push(message, {
			theme: {
				'--toastColor': colors.error.text,
				'--toastBackground': colors.error.bg,
				'--toastBarBackground': colors.error.bar
			}
		});
	},
	
	warning: (message: string) => {
		const colors = getThemeColors();
		svelteToast.push(message, {
			theme: {
				'--toastColor': colors.warning.text,
				'--toastBackground': colors.warning.bg,
				'--toastBarBackground': colors.warning.bar
			}
		});
	},
	
	info: (message: string) => {
		const colors = getThemeColors();
		svelteToast.push(message, {
			theme: {
				'--toastColor': colors.info.text,
				'--toastBackground': colors.info.bg,
				'--toastBarBackground': colors.info.bar
			}
		});
	}
};

// Keep the old function names for backward compatibility
export const showSuccessToast = toast.success;
export const showErrorToast = toast.error;
export const showInfoToast = toast.info;
export const showWarningToast = toast.warning;
