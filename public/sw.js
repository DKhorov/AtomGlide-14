// public/sw.js
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        console.log('Получены данные для пуша:', data); // Проверь это в консоли браузера

        const title = data.title || 'AtomGlide';
        const options = {
            body: data.body || 'Новое уведомление', // Вот здесь должно быть содержимое
            icon: data.icon || '/1.png',
            badge: '/1.png',
            data: {
                url: data.data?.url || '/'
            }
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (error) {
        console.error('Ошибка обработки пуша:', error);
    }
});
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});