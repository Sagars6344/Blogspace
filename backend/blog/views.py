from rest_framework import generics
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .models import Post, Comment, PasswordResetToken, Profile, Notification
from .serializers import PostSerializer


class PostListView(generics.ListAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer


@api_view(['GET'])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
        post.views += 1
        post.save()
        serializer = PostSerializer(post)
        return Response(serializer.data)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)


@api_view(['POST'])
def like_post(request, pk):
    try:
        post = Post.objects.get(pk=pk)
        post.likes += 1
        post.save()

        if request.user.is_authenticated and request.user != post.author:
            Notification.objects.create(
                recipient=post.author,
                sender=request.user,
                notif_type='like',
                post=post
            )

        return Response({'likes': post.likes})
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)


@api_view(['POST'])
def add_comment(request, pk):
    try:
        post = Post.objects.get(pk=pk)
        text = request.data.get('text')

        if request.user.is_authenticated:
            user = request.user
        else:
            username = request.data.get('username', 'Anonymous')
            user, created = User.objects.get_or_create(username=username)

        comment = Comment.objects.create(post=post, author=user, text=text)

        if user != post.author:
            Notification.objects.create(
                recipient=post.author,
                sender=user,
                notif_type='comment',
                post=post
            )

        return Response({
            'id': comment.id,
            'text': comment.text,
            'author_name': comment.author.username,
            'created_at': comment.created_at
        })
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)


@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'message': 'User created successfully', 'username': user.username})


@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'If this email exists, a reset link has been sent.'})

    token = get_random_string(48)

    PasswordResetToken.objects.filter(user=user).delete()
    PasswordResetToken.objects.create(user=user, token=token)

    reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"

    send_mail(
        subject='Reset your BlogSpace password',
        message=f'Click this link to reset your password: {reset_link}\n\nThis link expires in 1 hour.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({'message': 'If this email exists, a reset link has been sent.'})


@api_view(['POST'])
def reset_password(request):
    token = request.data.get('token')
    new_password = request.data.get('password')

    try:
        reset_token = PasswordResetToken.objects.get(token=token)
    except PasswordResetToken.DoesNotExist:
        return Response({'error': 'Invalid or expired token'}, status=400)

    if reset_token.created_at < timezone.now() - timedelta(hours=1):
        reset_token.delete()
        return Response({'error': 'Token expired'}, status=400)

    user = reset_token.user
    user.set_password(new_password)
    user.save()
    reset_token.delete()

    return Response({'message': 'Password reset successful'})


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_post(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    title = request.data.get('title')
    content = request.data.get('content')
    tag = request.data.get('tag', 'Technology')
    excerpt = request.data.get('excerpt', '')
    cover_image = request.FILES.get('cover_image')

    if not title or not content:
        return Response({'error': 'Title and content are required'}, status=400)

    emoji_map = {
        'Technology': '💻', 'Programming': '✨', 'AI': '🤖',
        'Career': '🚀', 'Design': '🎨'
    }

    post = Post.objects.create(
        title=title,
        content=content,
        excerpt=excerpt or content[:150],
        tag=tag,
        emoji=emoji_map.get(tag, '📝'),
        author=request.user,
        cover_image=cover_image
    )

    return Response({
        'id': post.id,
        'title': post.title,
        'message': 'Post published successfully'
    })


@api_view(['GET'])
def my_profile(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    user = request.user
    posts = Post.objects.filter(author=user).order_by('-created_at')

    total_views = sum(p.views for p in posts)
    total_likes = sum(p.likes for p in posts)

    profile, created = Profile.objects.get_or_create(user=user)

    data = {
        'username': user.username,
        'email': user.email,
        'phone': profile.phone,
        'post_count': posts.count(),
        'total_views': total_views,
        'total_likes': total_likes,
        'posts': PostSerializer(posts, many=True).data,
        'avatar_image': profile.avatar_image.url if profile.avatar_image else None,
        'cover_image': profile.cover_image.url if profile.cover_image else None,
        'subscriber_count': profile.subscribers.count(),
    }

    return Response(data)


@api_view(['GET'])
def public_profile(request, username):
    try:
        target_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    posts = Post.objects.filter(author=target_user).order_by('-created_at')
    total_views = sum(p.views for p in posts)
    total_likes = sum(p.likes for p in posts)

    profile, created = Profile.objects.get_or_create(user=target_user)

    is_subscribed = False
    if request.user.is_authenticated:
        is_subscribed = request.user in profile.subscribers.all()

    data = {
        'username': target_user.username,
        'post_count': posts.count(),
        'total_views': total_views,
        'total_likes': total_likes,
        'posts': PostSerializer(posts, many=True).data,
        'avatar_image': profile.avatar_image.url if profile.avatar_image else None,
        'cover_image': profile.cover_image.url if profile.cover_image else None,
        'subscriber_count': profile.subscribers.count(),
        'is_subscribed': is_subscribed,
        'is_own_profile': request.user.is_authenticated and request.user == target_user,
    }

    return Response(data)


@api_view(['GET'])
def dashboard_data(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    user = request.user
    posts = Post.objects.filter(author=user).order_by('-created_at')

    total_views = sum(p.views for p in posts)
    total_likes = sum(p.likes for p in posts)
    post_count = posts.count()

    top_posts = sorted(posts, key=lambda p: p.views, reverse=True)[:5]
    top_posts_data = [
        {'title': p.title, 'views': p.views, 'likes': p.likes}
        for p in top_posts
    ]

    recent_posts = posts[:5]
    recent_posts_data = [
        {
            'title': p.title,
            'date': p.created_at.strftime('%b %d'),
            'views': p.views,
            'likes': p.likes,
            'status': 'published'
        }
        for p in recent_posts
    ]

    return Response({
        'total_views': total_views,
        'total_likes': total_likes,
        'post_count': post_count,
        'top_posts': top_posts_data,
        'recent_posts': recent_posts_data,
    })


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def update_profile_images(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    profile, created = Profile.objects.get_or_create(user=request.user)

    avatar = request.FILES.get('avatar_image')
    cover = request.FILES.get('cover_image')

    if avatar:
        profile.avatar_image = avatar
    if cover:
        profile.cover_image = cover

    profile.save()

    return Response({
        'avatar_image': profile.avatar_image.url if profile.avatar_image else None,
        'cover_image': profile.cover_image.url if profile.cover_image else None,
    })


@api_view(['POST'])
def toggle_subscribe(request, username):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    try:
        target_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    if target_user == request.user:
        return Response({'error': 'You cannot subscribe to yourself'}, status=400)

    profile, created = Profile.objects.get_or_create(user=target_user)

    if request.user in profile.subscribers.all():
        profile.subscribers.remove(request.user)
        subscribed = False
    else:
        profile.subscribers.add(request.user)
        subscribed = True
        Notification.objects.create(
            recipient=target_user,
            sender=request.user,
            notif_type='subscribe'
        )

    return Response({
        'subscribed': subscribed,
        'subscriber_count': profile.subscribers.count()
    })


@api_view(['POST'])
def update_profile(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)

    new_username = request.data.get('username', '').strip()
    new_email = request.data.get('email', '').strip()
    new_phone = request.data.get('phone', '').strip()
    current_password = request.data.get('current_password', '')
    new_password = request.data.get('new_password', '')

    if new_username and new_username != user.username:
        if User.objects.filter(username=new_username).exclude(id=user.id).exists():
            return Response({'error': 'Username already taken'}, status=400)
        user.username = new_username

    if new_email:
        user.email = new_email

    if new_password:
        if not current_password:
            return Response({'error': 'Current password is required to set a new password'}, status=400)
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, status=400)
        user.set_password(new_password)

    user.save()

    profile.phone = new_phone
    profile.save()

    return Response({
        'message': 'Profile updated successfully',
        'username': user.username,
        'email': user.email,
        'phone': profile.phone,
    })


@api_view(['GET'])
def get_notifications(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    all_notifications = Notification.objects.filter(recipient=request.user)
    unread_count = all_notifications.filter(is_read=False).count()
    notifications = all_notifications[:30]

    icon_map = {'subscribe': '👥', 'like': '❤️', 'comment': '💬'}
    text_map = {
        'subscribe': 'subscribed to your blog',
        'like': 'liked your post',
        'comment': 'commented on your post',
    }

    data = []
    for n in notifications:
        item = {
            'id': n.id,
            'type': n.notif_type,
            'user': n.sender.username,
            'text': text_map[n.notif_type] + (f' "{n.post.title}"' if n.post else ''),
            'emoji': icon_map[n.notif_type],
            'is_read': n.is_read,
            'created_at': n.created_at,
            'post_id': n.post.id if n.post else None,
        }
        data.append(item)

    return Response({
        'notifications': data,
        'unread_count': unread_count
    })


@api_view(['POST'])
def mark_notifications_read(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'Marked as read'})