#!/bin/bash

# 1. Declare a constant IMAGE_REPOS with values "dvk-analyticsimage", "dvk-buildimage" (both accounts use same names)
IMAGE_REPOS=("dvk-analyticsimage" "dvk-buildimage")

# 2. Declare a constant DAYS_SINCE_LAST_PULL
DAYS_SINCE_LAST_PULL=30

# 3. Set a variable REMOVE_OLDER_THAN_DATE with value from current date - DAYS_SINCE_LAST_PULL
# use different date commands for macOS and Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    REMOVE_OLDER_THAN_DATE=$(date -v "-$DAYS_SINCE_LAST_PULL"d -I)
else
    # Linux
    REMOVE_OLDER_THAN_DATE=$(date -d "-$DAYS_SINCE_LAST_PULL days" -I)
fi

echo "Searching for images older than $REMOVE_OLDER_THAN_DATE:"

# 4. Set a variable OLD_IMAGES with a value from aws ecr describe-images which filters only images with lastRecordedPullTime older than REMOVE_OLDER_THAN_DATE
OLD_IMAGES=""
for repo in "${IMAGE_REPOS[@]}"; do
    images=$(aws ecr describe-images --repository-name "$repo" --query "imageDetails[?lastRecordedPullTime < '$REMOVE_OLDER_THAN_DATE']" --output json)
    OLD_IMAGES+="$images"
done

# 5. loop through and print all images
echo "Images older than $REMOVE_OLDER_THAN_DATE:"
echo "$OLD_IMAGES"

# 6. Loop through OLD_IMAGES and ask user if he wants to delete each image, present following info with every image: repositoryName, imageTags, imagePushedAt and lastRecordedPullTime
for image in $(echo "$OLD_IMAGES" | jq -r '.[].imageDigest'); do
    repo=$(echo "$OLD_IMAGES" | jq -r ".[] | select(.imageDigest == \"$image\") | .repositoryName")
    tags=$(echo "$OLD_IMAGES" | jq -r ".[] | select(.imageDigest == \"$image\") | .imageTags | join(\" \")")
    pushed_at=$(echo "$OLD_IMAGES" | jq -r ".[] | select(.imageDigest == \"$image\") | .imagePushedAt")
    last_pulled=$(echo "$OLD_IMAGES" | jq -r ".[] | select(.imageDigest == \"$image\") | .lastRecordedPullTime")

    read -p "Do you want to delete image $image from repository $repo (tags: $tags, pushed: $pushed_at, last pulled: $last_pulled)? (y/n/c) " answer
    case "$answer" in
        y|Y)
            aws ecr batch-delete-image --repository-name "$repo" --image-ids imageDigest="$image"
            echo "Deleted image $image from repository $repo."
            ;;
        n|N)
            echo "Skipping image $image from repository $repo."
            ;;
        c|C)
            echo "Exiting script."
            exit 0
            ;;
        *)
            echo "Invalid input. Skipping image $image from repository $repo."
            ;;
    esac
done
