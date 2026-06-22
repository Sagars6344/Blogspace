from rest_framework import serializers
from .models import Post, Comment, Profile

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'author_name', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    cover_image = serializers.ImageField(use_url=True, required=False)

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'excerpt', 'tag', 'emoji', 'cover_image',
                  'author_name', 'author_avatar', 'views', 'likes', 'created_at', 'comments']

    def get_author_avatar(self, obj):
        try:
            profile = Profile.objects.get(user=obj.author)
            if profile.avatar_image:
                return profile.avatar_image.url
        except Profile.DoesNotExist:
            pass
        return None