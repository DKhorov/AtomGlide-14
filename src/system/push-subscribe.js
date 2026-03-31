import axios from './axios';

const publicVapidKey = 'BDniXnUtpUSNDKVj71eAuoZyWSeUEghAhTd1UoG-a2ZgFi39hjuZN9kwg-q2HpELU2E52fwE7MvNzWH_Z0Mhd08';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const subscribeUserToPush = async () => {
    // 1. Моментальный выход, если браузер не поддерживает или уже отказано
    if (!('serviceWorker' in navigator) || Notification.permission === 'denied') return;

    // 2. Оборачиваем в setTimeout, чтобы НЕ блокировать загрузку контента
    setTimeout(async () => {
        try {
            // Регистрируем без await в основном потоке, если возможно
            const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            
            // Проверяем, есть ли уже подписка, чтобы не переподписываться и не ждать .ready
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log('Пользователь уже подписан');
                return; 
            }

            // Если подписки нет — только тогда ждем готовности (уже в фоновом режиме)
            const serviceWorkerReady = await navigator.serviceWorker.ready;
            
            const subscription = await serviceWorkerReady.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Отправляем на бэк без await, чтобы не ждать ответа сервера для работы сайта
            axios.post('/auth/save-push', subscription).catch(e => console.error('Ошибка сохранения на бэк'));
            
            console.log('Уведомления успешно включены!');
        } catch (err) {
            console.warn('Push Notification skipped or failed:', err.name);
        }
    }, 2000); // Задержка 2 секунды после старта страницы
};