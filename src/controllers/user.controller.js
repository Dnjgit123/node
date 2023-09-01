const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API

    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Fetch users and count their posts using aggregation
    const usersWithPostCount = await User.aggregate([
      {
        $lookup: {
          from: 'posts', 
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          posts: { $size: '$posts' },
        },
      },
    ])
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const nextPage = hasNextPage ? page + 1 : null;

    // Format the response
    const response = {
      data: {
        users: usersWithPostCount,
        pagination: {
          totalDocs: totalUsers,
          limit,
          page,
          totalPages,
          pagingCounter: skip + 1,
          hasPrevPage: page > 1,
          hasNextPage,
          prevPage: page > 1 ? page - 1 : null,
          nextPage,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

