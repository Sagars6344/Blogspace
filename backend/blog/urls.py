from django.urls import path
from .views import (PostListView, post_detail, like_post, add_comment,
                     register_user, forgot_password, reset_password,
                     create_post, my_profile, public_profile, dashboard_data,
                     update_profile_images, toggle_subscribe, update_profile,
                     get_notifications, mark_notifications_read)

urlpatterns = [
    path('posts/', PostListView.as_view(), name='post-list'),
    path('posts/<int:pk>/', post_detail, name='post-detail'),
    path('posts/<int:pk>/like/', like_post, name='post-like'),
    path('posts/<int:pk>/comment/', add_comment, name='post-comment'),
    path('register/', register_user, name='register'),
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/', reset_password, name='reset-password'),
    path('create-post/', create_post, name='create-post'),
    path('my-profile/', my_profile, name='my-profile'),
    path('profile/<str:username>/', public_profile, name='public-profile'),
    path('dashboard/', dashboard_data, name='dashboard'),
    path('update-profile-images/', update_profile_images, name='update-profile-images'),
    path('subscribe/<str:username>/', toggle_subscribe, name='toggle-subscribe'),
    path('update-profile/', update_profile, name='update-profile'),
    path('notifications/', get_notifications, name='notifications'),
    path('notifications/mark-read/', mark_notifications_read, name='mark-notifications-read'),
]