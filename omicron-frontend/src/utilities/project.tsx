// project-related stuff
export const projectID  = (window as any).projectID  as number;
export const projectURL = (window as any).projectURL as string;

export function getProject() {
	return fetch(projectURL)
		.then((response) => response.json());
}

// https://docs.djangoproject.com/en/4.0/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
export function getCookie(name: string) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}

export const csrftoken = getCookie('csrftoken');
